const { test, expect } = require('@playwright/test');
const ResultsPage = require('../pages/ResultsPage');

test.describe('Scenario 7: Quote Results', () => {
  let resultsPage;

  const resultsUrl = '/quote/results?type=it-technology&source=manual&employees=2-5&revenue=500k-1m&emirate=Dubai';
  const verifiedResultsUrl = `${resultsUrl}&businessName=Acme%20Tech%20LLC&licenseNumber=123456`;

  test.beforeEach(async ({ page }) => {
    resultsPage = new ResultsPage(page);
    await resultsPage.navigateTo(resultsUrl);
    await resultsPage.waitForResultsLoaded();
  });

  test('7.1 - should display the results shell with tabs and toggle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Your quotes' })).toBeVisible();
    await expect(resultsPage.individualTab).toBeVisible();
    await expect(resultsPage.bundleTab).toBeVisible();
    await expect(resultsPage.annualToggle).toBeVisible();
    await expect(resultsPage.monthlyToggle).toBeVisible();
    await expect(resultsPage.backButton).toBeVisible();
  });

  test('7.2 - quote cards show Select and Select & Buy buttons even when collapsed', async ({ page }) => {
    await expect(resultsPage.selectButtons.first()).toBeVisible();
    await expect(resultsPage.selectAndBuyButtons.first()).toBeVisible();
  });

  test('7.3 - should expand a quote card and show product line items', async ({ page }) => {
    await resultsPage.expandFirstQuoteCard();
    await expect(page.getByText("What's included")).toBeVisible();
    await expect(page.getByText(/Total/i)).toBeVisible();
    // Monthly price shown below annual in expanded view
    await expect(page.getByText(/instalment fee/i).first()).toBeVisible();
  });

  test('7.4 - first quote card shows Best for badge', async ({ page }) => {
    await expect(resultsPage.bestForBadge.first()).toBeVisible();
  });

  test('7.5 - coverage limits use pill buttons not dropdowns', async ({ page }) => {
    await expect(resultsPage.limitPill1M).toBeVisible();
    await expect(resultsPage.limitPill2M).toBeVisible();
    await expect(resultsPage.limitPill5M).toBeVisible();
  });

  test('7.6 - mandatory covers show Required badge', async ({ page }) => {
    await expect(resultsPage.requiredBadges.first()).toBeVisible();
  });

  test('7.7 - should switch Annual/Monthly and update prices', async ({ page }) => {
    await resultsPage.switchToMonthly();
    await expect(page.getByText(/\/mo/).first()).toBeVisible();
    await resultsPage.switchToAnnual();
    await expect(page.getByText(/\/yr/).first()).toBeVisible();
  });

  test('7.8 - should open AI Insights panel and show peer data with Add buttons', async ({ page }) => {
    await resultsPage.toggleAiInsights();
    await expect(page.getByText(/What similar businesses add/i)).toBeVisible();
    await expect(resultsPage.addButtons.first()).toBeVisible();
  });

  test('7.9 - should add an extra via AI Insights and show Added state', async ({ page }) => {
    await resultsPage.toggleAiInsights();
    await resultsPage.addFirstInsightExtra();
    await expect(resultsPage.addedButtons.first()).toBeVisible();
  });

  test('7.10 - should support filters and clearing them', async ({ page }) => {
    await page.getByRole('button', { name: /Filter/i }).click();
    await expect(page.getByText('Filters', { exact: true })).toBeVisible();
    await page.getByText('Shariah-compliant only').click();
    await page.getByRole('button', { name: 'Clear all' }).click();
  });

  test('7.11 - should switch to bundles showing Starting from prices', async ({ page }) => {
    await resultsPage.clickBundleTab();
    await expect(page.getByText(/Starting from/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /See Starter quotes/i })).toBeVisible();
  });

  test('7.12 - should select and deselect a quote from the sticky bar', async ({ page }) => {
    await resultsPage.selectFirstQuote();
    await expect(resultsPage.stickyBar).toBeVisible();
    // Deselect
    await resultsPage.selectButtons.first().click();
    await expect(resultsPage.stickyBar).toBeHidden();
  });

  test('7.13 - should continue to company details', async ({ page }) => {
    await resultsPage.selectFirstQuote();
    await resultsPage.clickContinue();
    await expect(page).toHaveURL(/\/quote\/company-details/);
  });

  test('7.14 - Select & Buy goes directly to checkout with company data', async ({ page }) => {
    await resultsPage.navigateTo(verifiedResultsUrl);
    await resultsPage.waitForResultsLoaded();
    await resultsPage.clickFirstSelectAndBuy();
    await expect(page).toHaveURL(/\/quote\/checkout/);
  });
});
