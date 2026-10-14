import { createServer, type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleLeadRequest } from '../src/lib/lead-handler';
import { leadSchema } from '../src/lib/lead-schema';

const validLead = {
  fullName: 'Maria Exemplo',
  email: 'maria.exemplo@gmail.com',
  phone: '(11) 99999-1234',
  clinic: 'Consultório Exemplo',
  patientVolume: '21 a 50',
  examFrequency: 'Na maioria dos atendimentos',
  recordVolume: '51 a 100',
  website: '',
};

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const servers: Server[] = [];

async function receiver(onRequest: RequestListener): Promise<string> {
  const server = createServer(onRequest);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}/leads`;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

describe('lead validation', () => {
  it('accepts personal emails and normalizes Brazilian WhatsApp numbers', () => {
    const result = leadSchema.parse(validLead);
    expect(result.email).toBe('maria.exemplo@gmail.com');
    expect(result.phone).toBe('+5511999991234');
  });

  it.each(['+55 (11) 99999-1234', '55 11 99999-1234', '+1 (415) 555-1234'])(
    'accepts a valid country-prefixed WhatsApp number: %s',
    (phone) => expect(leadSchema.safeParse({ ...validLead, phone }).success).toBe(true),
  );

  it.each(['1234', 'call me 11999991234', '+01234567890', '++5511999991234', '+55 11 1234'])(
    'rejects invalid phone input: %s',
    (phone) => expect(leadSchema.safeParse({ ...validLead, phone }).success).toBe(false),
  );

  it.each([
    'fullName',
    'email',
    'phone',
    'clinic',
    'patientVolume',
    'examFrequency',
    'recordVolume',
  ])('requires %s', (field) => {
    expect(leadSchema.safeParse({ ...validLead, [field]: undefined }).success).toBe(false);
  });
});

describe('POST lead handler', () => {
  it('returns 503 with an honest message when the webhook is missing', async () => {
    const fetchImpl = vi.fn();
    const response = await handleLeadRequest(request(validLead), { webhookUrl: '', fetchImpl });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      ok: false,
      message: 'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    'file:///tmp/leads',
    'javascript:alert(1)',
    'not-a-url',
    'https://user:pass@example.com',
  ])('refuses invalid webhook configuration: %s', async (webhookUrl) => {
    const fetchImpl = vi.fn();
    const response = await handleLeadRequest(request(validLead), { webhookUrl, fetchImpl });
    expect(response.status).toBe(503);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects invalid enums server-side with field errors', async () => {
    const fetchImpl = vi.fn();
    const response = await handleLeadRequest(request({ ...validLead, recordVolume: 'invalid' }), {
      webhookUrl: 'https://example.com',
      fetchImpl,
    });
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.recordVolume).toHaveLength(1);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects the honeypot and does not report fake success', async () => {
    const fetchImpl = vi.fn();
    const response = await handleLeadRequest(
      request({ ...validLead, website: 'https://spam.example' }),
      { webhookUrl: 'https://example.com', fetchImpl },
    );
    expect(response.status).toBe(400);
    expect((await response.json()).ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const bad = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{broken',
    });
    expect((await handleLeadRequest(bad)).status).toBe(400);
  });

  it('returns 400 for non-JSON content', async () => {
    expect(
      (await handleLeadRequest(request(validLead, { 'Content-Type': 'text/plain' }))).status,
    ).toBe(400);
  });

  it('rejects bodies above 16 KB even without Content-Length', async () => {
    const fetchImpl = vi.fn();
    const response = await handleLeadRequest(
      request({ ...validLead, oversized: 'x'.repeat(16 * 1024) }),
      { webhookUrl: 'https://example.com', fetchImpl },
    );
    expect(response.status).toBe(413);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('stops reading a chunked body immediately when the limit is exceeded', async () => {
    let cancelled = false;
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new Uint8Array(9_000));
      },
      cancel() {
        cancelled = true;
      },
    });
    const streamed = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    const response = await handleLeadRequest(streamed, { webhookUrl: '' });
    expect(response.status).toBe(413);
    expect(cancelled).toBe(true);
    expect(pulls).toBeLessThanOrEqual(3);
  });

  it('enforces the declared size before consuming the body', async () => {
    const response = await handleLeadRequest(request(validLead, { 'Content-Length': '16385' }));
    expect(response.status).toBe(413);
  });

  it('delivers only validated data and safe attribution to a real local HTTP receiver', async () => {
    let received: Record<string, unknown> | undefined;
    const webhookUrl = await receiver(async (incoming, outgoing) => {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      received = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      outgoing.writeHead(202).end();
    });
    const response = await handleLeadRequest(
      request({
        ...validLead,
        source: 'https://example.com?email=private@example.com',
        extra: 'private data',
        utm: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'medicos_integrativos',
          utm_content: 'private@example.com',
          utm_term: '+5511999991234',
          email: 'private@example.com',
        },
      }),
      { webhookUrl },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(received).toMatchObject({
      fullName: validLead.fullName,
      phone: '+5511999991234',
      source: 'biosenz-landing-page',
      utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'medicos_integrativos' },
    });
    expect(received).not.toHaveProperty('website');
    expect(received).not.toHaveProperty('extra');
    expect(received?.utm).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'medicos_integrativos',
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([301, 400, 500])('returns 502 if the receiver responds %s', async (status) => {
    const webhookUrl = await receiver((_incoming, outgoing) => {
      outgoing
        .writeHead(status, { Location: 'https://example.com/unintended' })
        .end('private error');
    });
    const response = await handleLeadRequest(request(validLead), { webhookUrl });
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private error');
  });

  it('returns 504 if a real local receiver fails to acknowledge in time', async () => {
    const webhookUrl = await receiver(() => {
      /* Intentionally never acknowledge. */
    });
    const response = await handleLeadRequest(request(validLead), { webhookUrl, timeoutMs: 40 });
    expect(response.status).toBe(504);
    expect((await response.json()).code).toBe('delivery_timeout');
  });

  it('returns 502 on network failure without logging or returning PII', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchImpl = vi.fn().mockRejectedValue(new Error('private@example.com'));
    const response = await handleLeadRequest(request(validLead), {
      webhookUrl: 'https://example.com',
      fetchImpl,
    });
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private@example.com');
    expect(logger).not.toHaveBeenCalled();
  });
});
