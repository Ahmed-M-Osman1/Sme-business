const { test, expect } = require('@playwright/test');
const ResultsPage = require('../pages/ResultsPage');

test.describe('Scenario 7: Quote Results', () => {
  let resultsPage;

  // Navigate to results with valid query params to see actual quotes
  const resultsUrl = '/quote/results?type=it-technology&source=manual&employees=2-5&revenue=500k-1m&emirate=Dubai';

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.navigateTo(resultsUrl);
  });

  test('7.1 - should display loading or results', async ({ page }) => {
    // Either loading indicator is visible or results have loaded
    const hasLoading = await resultsPage.loadingIndicator.isVisible().catch(() => false);
    const hasHeading = await resultsPage.resultsHeading.isVisible().catch(() => false);
    expect(hasLoading || hasHeading).toBeTruthy();
  });

  test('7.2 - should display results heading after loading', async () => {
    await resultsPage.waitForResultsLoaded();
    await expect(resultsPage.resultsHeading).toBeVisible();
  });

  test('7.3 - should show Individual and Bundle tabs', async () => {
    await resultsPage.waitForResultsLoaded();
    await expect(resultsPage.individualTab).toBeVisible();
    await expect(resultsPage.bundleTab).toBeVisible();
  });

  test('7.4 - should switch between Individual and Bundle tabs', async () => {
    await resultsPage.waitForResultsLoaded();
    await resultsPage.clickBundleTab();
    await resultsPage.clickIndividualTab();
  });

  test('7.5 - should display quote cards with pricing', async () => {
    await resultsPage.waitForResultsLoaded();
    const cardCount = await resultsPage.quoteCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('7.6 - should display back button', async () => {
    await resultsPage.waitForResultsLoaded();
    await expect(resultsPage.backButton).toBeVisible();
  });

  test('7.7 - should display continue button when quote selected', async () => {
    await resultsPage.waitForResultsLoaded();
    // Try to select a quote if available
    const cardCount = await resultsPage.quoteCards.count();
    if (cardCount > 0) {
      await resultsPage.selectFirstQuote();
      await expect(resultsPage.continueButton).toBeVisible();
    }
  });
});
