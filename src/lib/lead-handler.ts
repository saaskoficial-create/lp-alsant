import { z } from 'zod';
import { leadSchema } from './lead-schema';

const MAX_BODY_BYTES = 16 * 1024;
const DEFAULT_TIMEOUT_MS = 8_000;
const DELIVERY_ERROR = 'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

type UtmKey = (typeof UTM_KEYS)[number];

export interface LeadHandlerOptions {
  webhookUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

class PayloadTooLarge extends Error {}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength && Number(declaredLength) > MAX_BODY_BYTES) {
    throw new PayloadTooLarge();
  }
  if (!request.body) throw new SyntaxError('Missing body');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        // Do not let cancellation of an untrusted stream delay rejection.
        void reader.cancel().catch(() => undefined);
        throw new PayloadTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

function safeUtm(input: unknown): Partial<Record<UtmKey, string>> {
  const output: Partial<Record<UtmKey, string>> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return output;

  for (const key of UTM_KEYS) {
    const value = (input as Record<string, unknown>)[key];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    // Accept campaign identifiers, not URLs, emails, free text or phone numbers.
    if (
      /^[a-zA-Z0-9_.-]{1,100}$/.test(trimmed) &&
      !/\d{7,}/.test(trimmed) &&
      !/^(?:\+?\d[\s().-]*){8,}$/.test(trimmed)
    ) {
      output[key] = trimmed;
    }
  }
  return output;
}

function webhookAddress(value: string | undefined): URL | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}

export async function handleLeadRequest(
  request: Request,
  options: LeadHandlerOptions = {},
): Promise<Response> {
  if (request.method !== 'POST') {
    const response = json(405, {
      ok: false,
      code: 'method_not_allowed',
      message: 'Método não permitido.',
    });
    response.headers.set('Allow', 'POST');
    return response;
  }

  const contentType = request.headers.get('content-type')?.split(';')[0].trim();
  if (contentType?.toLowerCase() !== 'application/json') {
    return json(400, {
      ok: false,
      code: 'invalid_request',
      message: 'Confira os dados e tente novamente.',
    });
  }

  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    return json(error instanceof PayloadTooLarge ? 413 : 400, {
      ok: false,
      code: error instanceof PayloadTooLarge ? 'payload_too_large' : 'invalid_request',
      message: 'Confira os dados e tente novamente.',
    });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return json(400, {
      ok: false,
      code: 'validation_error',
      message: 'Confira os campos indicados e tente novamente.',
      fieldErrors,
    });
  }

  // The webhook is resolved only on the server and never returned to the client.
  const webhook = webhookAddress(options.webhookUrl ?? process.env.LEAD_WEBHOOK_URL);
  if (!webhook) {
    return json(503, { ok: false, code: 'delivery_unavailable', message: DELIVERY_ERROR });
  }

  const lead = { ...parsed.data };
  delete lead.website;
  const payload = {
    ...lead,
    source: 'biosenz-landing-page',
    submittedAt: new Date().toISOString(),
    utm: safeUtm((body as Record<string, unknown>).utm),
  };

  const abortController = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);
  try {
    const response = await (options.fetchImpl ?? fetch)(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: abortController.signal,
      redirect: 'manual',
    });

    // A redirect or error is not delivery acceptance. Do not expose upstream text.
    const accepted = response.status >= 200 && response.status < 300;
    void response.body?.cancel().catch(() => undefined);
    if (!accepted) {
      return json(502, { ok: false, code: 'delivery_failed', message: DELIVERY_ERROR });
    }
    return json(200, { ok: true });
  } catch {
    return json(abortController.signal.aborted ? 504 : 502, {
      ok: false,
      code: abortController.signal.aborted ? 'delivery_timeout' : 'delivery_failed',
      message: DELIVERY_ERROR,
    });
  } finally {
    clearTimeout(timeout);
  }
}
