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
    '[data-testid="hud-list"] [data-variant="stats.buds"] .stat-item__value',
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

test('keeps mobile touch menus and shop details usable', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile, 'mobile touch audit');

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

  const expectNoHorizontalOverflow = async () => {
    const overflow = await page.evaluate(() => {
      const width = window.innerWidth;
      return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  };

  await expectNoHorizontalOverflow();

  const shopMedia = page.locator('.shop-card__media').first();
  const shopDetails = page.locator('.shop-card__details-popover').first();
  await shopMedia.tap();
  await expect(shopDetails).toBeVisible();

  const detailBox = await shopDetails.boundingBox();
  const viewport = page.viewportSize();
  expect(detailBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(detailBox!.x).toBeGreaterThanOrEqual(-1);
  expect(detailBox!.x + detailBox!.width).toBeLessThanOrEqual(viewport!.width + 1);
  await expect(shopDetails).toContainText(/Kosten|Cost|Besitzt|Owned|BPS/i);
  await expectNoHorizontalOverflow();

  await page.getByRole('button', { name: /Menü|Menu/i }).tap();
  const menuDialog = page.getByRole('dialog', { name: /Menü|Menu/i });
  await expect(menuDialog).toBeVisible();

  const selects = menuDialog.locator('select');
  await expect(selects).toHaveCount(3);
  await selects.last().scrollIntoViewIfNeeded();

  const selectContrast = await selects.evaluateAll((elements) =>
    elements.map((select) => {
      const option = select.options[0];
      const optionStyle = option ? getComputedStyle(option) : null;
      return {
        optionColor: optionStyle?.color ?? '',
        optionBackground: optionStyle?.backgroundColor ?? '',
      };
    }),
  );
  expect(selectContrast).not.toContainEqual(
    expect.objectContaining({
      optionColor: 'rgb(255, 255, 255)',
      optionBackground: 'rgb(255, 255, 255)',
    }),
  );

  for (const select of await selects.all()) {
    const values = await select
      .locator('option')
      .evaluateAll((options) => options.map((option) => option.value));
    if (values[1]) {
      await select.selectOption(values[1]);
    }
  }

  await expectNoHorizontalOverflow();
  await menuDialog.getByRole('button', { name: /Schließen|Close/i }).tap();
  await expect(menuDialog).toBeHidden();

  if (browserName !== 'webkit') {
    for (const tabName of [
      /Shop/i,
      /Power/i,
      /Lab|Labor/i,
      /Greenhouse|Gewächshaus/i,
      /Ascend|Aufstieg/i,
      /Goals|Ziele/i,
    ]) {
      const tab = page.getByRole('tab', { name: tabName }).first();
      if ((await tab.count()) > 0) {
        await tab.scrollIntoViewIfNeeded();
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expectNoHorizontalOverflow();
      }
    }
  }

  expect(failedResources).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
