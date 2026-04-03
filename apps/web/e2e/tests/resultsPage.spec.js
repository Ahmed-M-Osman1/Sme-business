const { test, expect } = require('@playwright/test');
const ResultsPage = require('../pages/ResultsPage');
const { startCoverage, stopCoverage } = require('../helpers/coverage');

test.describe('Scenario 7: Quote Results', () => {
  let resultsPage;

  const resultsUrl = '/quote/results?type=it-technology&source=manual&employees=2-5&revenue=500k-1m&emirate=Dubai';
  const verifiedResultsUrl = `${resultsUrl}&businessName=Acme%20Tech%20LLC&licenseNumber=123456`;

  async function getQuoteCards(page) {
    return page.locator('div.rounded-2xl.border.bg-white.transition-all.duration-300');
  }

  async function expandFirstQuoteCard(page) {
    const firstCard = (await getQuoteCards(page)).first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole('button').first().click();
    return firstCard;
  }

  async function selectFirstQuote(page) {
    const firstCard = await expandFirstQuoteCard(page);
    const selectButton = firstCard.getByRole('button', { name: /^Select$|^Selected$/ });
    await expect(selectButton).toBeVisible();
    await selectButton.click();
    return firstCard;
  }

  test.beforeEach(async ({ page }) => {
    await startCoverage(page);
    resultsPage = new ResultsPage(page);
    await resultsPage.navigateTo(resultsUrl);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await stopCoverage(page, testInfo);
  });

  test('7.1 - should display the results shell after loading', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    await expect(page.getByRole('heading', { name: 'Your quotes' })).toBeVisible();
    await expect(resultsPage.individualTab).toBeVisible();
    await expect(resultsPage.bundleTab).toBeVisible();
    await expect(resultsPage.backButton).toBeVisible();
  });

  test('7.2 - should expand a quote card and show product details', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    const firstCard = await expandFirstQuoteCard(page);
    await expect(firstCard.getByText("What's included")).toBeVisible();
    await expect(firstCard.getByText(/Total/i)).toBeVisible();
    await expect(firstCard.getByText(/Monthly payments powered by/i)).toBeVisible();
  });

  test('7.3 - should support filters and clearing them', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    await page.getByRole('button', { name: /Filter/i }).click();
    await expect(page.getByText('Filters', { exact: true })).toBeVisible();
    await page.getByText('Shariah-compliant only').click();

    const maxPriceSlider = page.locator('input[type="range"]').first();
    const initialMaxValue = await maxPriceSlider.getAttribute('max');
    await maxPriceSlider.evaluate((element) => {
      const nextValue = Math.max(Number(element.min), Math.floor(Number(element.max) * 0.7));
      element.value = String(nextValue);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(maxPriceSlider).not.toHaveValue(initialMaxValue || '');
    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(maxPriceSlider).toHaveValue(initialMaxValue || '');
  });

  test('7.4 - should switch payment cadence and open AI insights', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page.getByText('/month').first()).toBeVisible();
    await page.getByRole('button', { name: /Shory AI Insights/i }).click();
    await expect(page.getByText(/What similar businesses add/i)).toBeVisible();
  });

  test('7.5 - should switch to bundles, drill in, and go back', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    await resultsPage.clickBundleTab();
    await expect(page.getByRole('button', { name: /See Starter quotes/i })).toBeVisible();
    await page.getByRole('button', { name: /See Starter quotes/i }).click();
    await expect(page.getByRole('button', { name: /Back to bundles/i })).toBeVisible();
    await page.getByRole('button', { name: /Back to bundles/i }).click();
    await expect(page.getByRole('button', { name: /See Starter quotes/i })).toBeVisible();
  });

  test('7.6 - should select and deselect a quote from the sticky bar flow', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    const firstCard = await selectFirstQuote(page);
    await expect(resultsPage.stickyBar).toBeVisible();

    await firstCard.getByRole('button', { name: /Selected/i }).click();
    await expect(resultsPage.stickyBar).toBeHidden();
  });

  test('7.7 - should continue to company details when company data is missing', async ({ page }) => {
    await resultsPage.waitForResultsLoaded();
    await selectFirstQuote(page);
    await expect(resultsPage.continueButton).toBeVisible();
    await resultsPage.clickContinue();
    await expect(page).toHaveURL(/\/quote\/company-details/);
  });

  test('7.8 - should continue directly to checkout when company data is already present', async ({ page }) => {
    await resultsPage.navigateTo(verifiedResultsUrl);
    await resultsPage.waitForResultsLoaded();
    await selectFirstQuote(page);
    await expect(resultsPage.continueButton).toBeVisible();
    await resultsPage.clickContinue();
    await expect(page).toHaveURL(/\/quote\/checkout/);
  });
});
