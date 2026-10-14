import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const MOCK = 'http://127.0.0.1:4399';
const MISSING_WEBHOOK_APP = 'http://127.0.0.1:4323';
const unavailable = 'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.';
const success =
  'Solicitação recebida! Nosso time entrará em contato para agendar sua demonstração.';
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

async function openForm(page: Page, url = '/#demonstracao') {
  await page.goto(url);
  const form = page.getByRole('form', { name: 'Solicitar demonstração' });
  await form.scrollIntoViewIfNeeded();
  await expect(form).toBeVisible();
  await expect(
    page.locator('astro-island:has(form[aria-label="Solicitar demonstração"])'),
  ).not.toHaveAttribute('ssr', '');
  return form;
}

async function fillForm(page: Page) {
  for (const field of ['fullName', 'email', 'phone', 'clinic'] as const) {
    await page.locator(`#${field}`).fill(validLead[field]);
  }
  for (const field of ['patientVolume', 'examFrequency', 'recordVolume'] as const) {
    await page.locator(`#${field}`).selectOption(validLead[field]);
  }
}

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${MOCK}/_control`, { data: { mode: 'success' } });
  expect(response.ok()).toBeTruthy();
});

test('invalid inputs remain in the form and do not reach the webhook', async ({
  page,
  request,
}) => {
  const form = await openForm(page);
  await form.getByRole('button').click();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(7);
  await expect(page.locator('#fullName')).toBeFocused();
  await expect(form.getByRole('status')).not.toContainText(success);
  expect((await (await request.get(`${MOCK}/_state`)).json()).count).toBe(0);
});

test('missing webhook returns 503 and keeps an honest recoverable error in the UI', async ({
  page,
  request,
}) => {
  const api = await request.post(`${MISSING_WEBHOOK_APP}/api/leads`, { data: validLead });
  expect(api.status()).toBe(503);
  expect((await api.json()).message).toBe(unavailable);
  const form = await openForm(page, `${MISSING_WEBHOOK_APP}/#demonstracao`);
  await fillForm(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toHaveText(unavailable);
  await expect(form.getByRole('status')).toBeFocused();
  await expect(page.locator('#email')).toHaveValue(validLead.email);
  await expect(form.getByRole('button')).toBeEnabled();
  expect((await (await request.get(`${MOCK}/_state`)).json()).count).toBe(0);
});

test('a real local 2xx receiver produces the success state and approved attribution', async ({
  page,
  request,
}) => {
  const form = await openForm(
    page,
    '/?utm_source=google&utm_medium=cpc&utm_campaign=medicos#demonstracao',
  );
  await fillForm(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('status')).toHaveText(success);
  await expect(form.getByRole('status')).toBeFocused();
  await expect(form.getByRole('button')).toHaveCount(0);
  const state = await (await request.get(`${MOCK}/_state`)).json();
  expect(state.count).toBe(1);
  expect(state.requests[0]).toMatchObject({
    fullName: validLead.fullName,
    phone: '+5511999991234',
    source: 'biosenz-landing-page',
    utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'medicos' },
  });
  expect(state.requests[0]).not.toHaveProperty('website');
});

test('upstream failure never produces success and lets the visitor retry', async ({
  page,
  request,
}) => {
  await request.post(`${MOCK}/_control`, { data: { mode: 'failure' } });
  const form = await openForm(page);
  await fillForm(page);
  const response = page.waitForResponse((response) => response.url().endsWith('/api/leads'));
  await form.getByRole('button').click();
  expect((await response).status()).toBe(502);
  await expect(form.getByRole('status')).toHaveText(unavailable);
  await expect(form.getByRole('button')).toBeEnabled();
  await expect(page.locator('#fullName')).toHaveValue(validLead.fullName);
});

test('a pending request disables submission and duplicate attempts reach the receiver once', async ({
  page,
  request,
}) => {
  await request.post(`${MOCK}/_control`, { data: { mode: 'pending' } });
  const form = await openForm(page);
  await fillForm(page);
  await form.getByRole('button').click();
  await expect(form.getByRole('button')).toBeDisabled();
  await expect(form.getByRole('button')).toHaveText('Enviando solicitação…');
  await expect(form).toHaveAttribute('aria-busy', 'true');
  await expect.poll(async () => (await (await request.get(`${MOCK}/_state`)).json()).count).toBe(1);
  await form.evaluate((element) => {
    (element as HTMLFormElement).requestSubmit();
    (element as HTMLFormElement).requestSubmit();
  });
  await page.locator('#clinic').press('Enter');
  await expect(form.getByRole('button')).toBeDisabled();
  await expect(form).toHaveAttribute('aria-busy', 'true');
  await expect(form.getByRole('status')).not.toContainText(success);
  expect((await (await request.get(`${MOCK}/_state`)).json()).count).toBe(1);
  await request.post(`${MOCK}/_release`);
  await expect(form.getByRole('status')).toHaveText(success);
  expect((await (await request.get(`${MOCK}/_state`)).json()).count).toBe(1);
});

test('webhook timeout becomes 504 and restores the submit button', async ({ page, request }) => {
  await request.post(`${MOCK}/_control`, { data: { mode: 'timeout' } });
  const form = await openForm(page);
  await fillForm(page);
  const response = page.waitForResponse((response) => response.url().endsWith('/api/leads'));
  await form.getByRole('button').click();
  expect((await response).status()).toBe(504);
  await expect(form.getByRole('status')).toHaveText(unavailable);
  await expect(form.getByRole('button')).toBeEnabled();
});

for (const width of [360, 390, 768, 1440]) {
  test(`responsive ${width}px: readable page, working conversion anchor and no horizontal overflow`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.hero .button')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await page.locator('.hero .button').click();
    await expect(page).toHaveURL(/#demonstracao$/);
    await expect(page.locator('#fullName')).toBeVisible();
    await expect(page.locator('#patientVolume')).toBeVisible();
    await expect(page.locator('.form-submit')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath(`viewport-${width}.png`), fullPage: true });
  });
}

test('mobile navigation and conversion controls work with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('header .brand')).toBeFocused();
  await page.keyboard.press('Tab');
  const menu = page.locator('.menu-toggle');
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter');
  for (const link of await page.locator('#mobile-menu a').all()) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
  }
  await expect(page.locator('#mobile-menu a').last()).toHaveAttribute('href', '#demonstracao');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#demonstracao$/);
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(
    page.locator('astro-island:has(form[aria-label="Solicitar demonstração"])'),
  ).not.toHaveAttribute('ssr', '');
  await page.locator('#fullName').focus();
  for (const id of ['email', 'phone', 'clinic', 'patientVolume', 'examFrequency', 'recordVolume']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(`#${id}`)).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(page.locator('.form-submit')).toBeFocused();
});

test('reduced motion leaves the full comparison heading readable without split animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#rotina');
  const heading = page.getByRole('heading', {
    name: 'Veja como muda a sua rotina clínica.',
    exact: true,
  });
  await expect(heading).toBeVisible();
  await expect(heading.locator('[aria-hidden="true"]')).toHaveText(
    'Veja como muda a sua rotina clínica.',
  );
  await expect(heading.locator('.split-word')).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
  await expect(page.locator('#hero-title')).toBeVisible();
});

function observeMotionResources(page: Page) {
  const videoRequests: string[] = [];
  const failures: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('.mp4')) videoRequests.push(request.url());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    failures.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`);
  });
  page.on('pageerror', (error) => failures.push(error.message));
  return { videoRequests, failures };
}

test('product modules show the selected real screenshot and support arrow, Home, End and Tab navigation', async ({ page }) => {
  const resources = observeMotionResources(page);
  await page.goto('/#plataforma');
  const tabs = page.getByRole('tablist', { name: 'Conheça os módulos da Biosenz' });
  await expect(tabs).toBeVisible();
  const modules = [
    { label: 'Assistentes', image: 'biosenz-assistentes.webp' },
    { label: 'Pacientes', image: 'biosenz-pacientes.webp' },
    { label: 'Consultas', image: 'biosenz-consultas.webp' },
  ];

  async function expectSelection(label: string) {
    const tab = tabs.getByRole('tab', { name: label, exact: true });
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveAttribute('tabindex', '0');
    await expect(tabs.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel', { name: label, exact: true })).toBeVisible();
  }

  for (const module of modules) {
    await tabs.getByRole('tab', { name: module.label, exact: true }).click();
    await expectSelection(module.label);
    const panel = page.getByRole('tabpanel', { name: module.label, exact: true });
    const screenshot = panel.getByRole('img');
    await expect(screenshot).toHaveAttribute('src', `/demo/${module.image}`);
    await expect(screenshot).toHaveAttribute(
      'alt', `Módulo ${module.label} na demonstração oficial da Biosenz com dados fictícios.`,
    );
    await expect.poll(() => screenshot.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
      .toBe(true);
  }

  for (const [key, selected] of [
    ['ArrowRight', 'Assistentes'], ['ArrowLeft', 'Consultas'], ['Home', 'Assistentes'],
    ['End', 'Consultas'], ['ArrowLeft', 'Pacientes'],
  ]) {
    await page.keyboard.press(key);
    await expectSelection(selected);
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tabpanel', { name: 'Pacientes', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(tabs.getByRole('tab', { name: 'Pacientes', exact: true })).toBeFocused();
  expect(resources.failures).toEqual([]);
});

test('motion video is deferred below the hero, plays on entry, honors pause and pauses on exit', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const resources = observeMotionResources(page);
  await page.goto('/');
  const video = page.locator('#anatomy-film');
  const control = page.locator('.motion-control');
  await expect(control).not.toHaveAttribute('hidden', '');
  await expect(page.locator('#hero-title')).toBeInViewport();
  await expect(video).not.toHaveAttribute('src', /.+/);
  expect(resources.videoRequests).toHaveLength(0);

  await page.locator('#difference-title').scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('src', '/media/biosenz-anatomy.mp4');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(control).toHaveAccessibleName('Pausar vídeo');
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted)).toBe(true);
  await control.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(control).toHaveAccessibleName('Reproduzir vídeo');
  await control.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await page.locator('#hero-title').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(resources.videoRequests.length).toBeGreaterThan(0);
  expect(resources.failures).toEqual([]);
});

test('reduced motion keeps the poster without downloading video until an explicit play click', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const resources = observeMotionResources(page);
  await page.goto('/');
  const video = page.locator('#anatomy-film');
  const control = page.locator('.motion-control');
  await expect(control).not.toHaveAttribute('hidden', '');
  await page.locator('#difference-title').scrollIntoViewIfNeeded();
  const poster = page.locator('.anatomy-poster');
  await expect(poster).toBeVisible();
  await expect(poster).toHaveAttribute('src', '/media/biosenz-anatomy-poster.webp');
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(control).toHaveAccessibleName('Reproduzir vídeo');
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(resources.videoRequests).toHaveLength(0);

  await control.click();
  await expect(video).toHaveAttribute('src', '/media/biosenz-anatomy.mp4');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(control).toHaveAccessibleName('Pausar vídeo');
  expect(resources.videoRequests.length).toBeGreaterThan(0);
  await control.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(resources.failures).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('copy remains readable and the disabled POST form cannot leak fields into the URL', async ({
    page,
    request,
  }) => {
    await page.goto('/#demonstracao');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Veja como muda a sua rotina clínica.', exact: true }),
    ).toBeVisible();
    const form = page.getByRole('form', { name: 'Solicitar demonstração' });
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form.getByRole('button')).toBeDisabled();
    // Playwright's text selector deliberately skips noscript content.
    await expect(page.locator('.noscript-note')).toHaveText(
      'Ative o JavaScript no navegador para preencher e enviar o formulário.',
    );
    await expect(page.locator('.noscript-note')).toBeVisible();
    await fillForm(page);
    await page.locator('#clinic').press('Enter');
    await expect(page).toHaveURL('http://127.0.0.1:4322/#demonstracao');
    expect((await (await request.get(`${MOCK}/_state`)).json()).count).toBe(0);
  });
});

test('200 percent equivalent viewport reflow keeps controls usable (1440 / 2, DPR 2)', async ({
  browser,
}, testInfo) => {
  // Model the CSS viewport at 200% on a 1440px screen. This does not claim
  // to exercise native Ctrl+zoom; CSS zoom alone does not change media queries.
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4322',
    viewport: { width: 720, height: 500 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const form = page.getByRole('form', { name: 'Solicitar demonstração' });
    await form.scrollIntoViewIfNeeded();
    await expect(
      page.locator('astro-island:has(form[aria-label="Solicitar demonstração"])'),
    ).not.toHaveAttribute('ssr', '');
    await fillForm(page);
    await expect(form.getByRole('button')).toBeEnabled();
    for (const field of [
      'fullName',
      'email',
      'phone',
      'clinic',
      'patientVolume',
      'examFrequency',
      'recordVolume',
    ]) {
      const input = page.locator(`#${field}`);
      await input.scrollIntoViewIfNeeded();
      const bounds = await input.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(721);
    }
    await page.screenshot({
      path: testInfo.outputPath('reflow-200-percent-equivalent.png'),
      fullPage: true,
    });
  } finally {
    await context.close();
  }
});

for (const width of [390, 1440]) {
  test(`WCAG AA automated audit at ${width}px, including form errors`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const form = await openForm(page);
    await form.getByRole('button').click();
    await expect(page.locator('#fullName-error')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    await testInfo.attach(`axe-${width}`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    expect(results.violations).toEqual([]);
  });
}
