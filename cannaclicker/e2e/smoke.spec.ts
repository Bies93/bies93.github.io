import { expect, test } from '@playwright/test';

test('loads the game, clicks once, and renders image assets', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedResources: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    const request = response.request();
    if (
      response.status() >= 400 &&
      ['document', 'script', 'stylesheet', 'image', 'font'].includes(request.resourceType())
    ) {
      failedResources.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');

  const clickButton = page.getByTestId('click-button');
  const budsValue = page.locator(
    '[data-testid="clicker-card"] [data-variant="stats.buds"] .stat-item__value',
  );

  await expect(clickButton).toBeVisible();
  await expect(budsValue).toHaveText(/^0(?:[,.]00)?$/);

  await clickButton.click();

  await expect(budsValue).toHaveText(/^1(?:[,.]00)?$/);
  await expect(page.getByTestId('control-strip')).toBeVisible();

  const brokenImages = await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.race([
      Promise.all(
        images.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener('error', () => resolve(), { once: true });
            }),
        ),
      ),
      new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
    ]);
    return images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);
  });

  expect(brokenImages).toEqual([]);
  expect(failedResources).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('uses accessible custom modals for save export, import, and reset', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');

  await page.getByRole('button', { name: /Export/i }).click();
  await expect(page.getByRole('dialog', { name: /Export/i })).toBeVisible();
  await expect(page.locator('textarea[readonly]')).toHaveValue(/[A-Za-z0-9+/=]{20,}/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Export/i })).toBeHidden();

  await page.getByRole('button', { name: /Import/i }).click();
  const importDialog = page.getByRole('dialog', { name: /Import/i });
  await expect(importDialog).toBeVisible();
  await importDialog.getByRole('textbox').fill('not-a-save');
  await importDialog.getByRole('button', { name: /Import/i }).click();
  await expect(importDialog).toContainText(/fehlgeschlagen|failed/i);
  await importDialog.getByRole('button', { name: /Abbrechen|Cancel/i }).click();

  await page.getByRole('button', { name: /Reset/i }).click();
  const resetDialog = page.getByRole('dialog', { name: /Reset|zurücksetzen/i });
  await expect(resetDialog).toBeVisible();
  await expect(resetDialog.getByRole('button', { name: /löschen|delete/i })).toBeDisabled();
  await resetDialog.getByRole('textbox').fill('RESET');
  await expect(resetDialog.getByRole('button', { name: /löschen|delete/i })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(resetDialog).toBeHidden();

  expect(consoleErrors).toEqual([]);
});
