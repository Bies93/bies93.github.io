import { expect, test } from '@playwright/test';

test('loads the game, clicks once, and renders image assets', async ({ page }) => {
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
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    return images
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);
  });

  expect(brokenImages).toEqual([]);
});
