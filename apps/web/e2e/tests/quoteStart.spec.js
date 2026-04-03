const { test, expect } = require('@playwright/test');
const QuoteStartPage = require('../pages/QuoteStartPage');

test.describe('Scenario 2: Quote Start — Method Selection', () => {
  let quoteStartPage;

  test.beforeEach(async ({ page }) => {
    quoteStartPage = new QuoteStartPage(page);
    await quoteStartPage.open();
  });

  test('2.1 - should display step 1 of 6 indicator', async () => {
    await expect(quoteStartPage.stepIndicator).toBeVisible();
  });

  test('2.2 - should show all 4 method options', async () => {
    await quoteStartPage.verifyAllOptionsVisible();
  });

  test('2.3 - should navigate to AI Advisor page', async ({ page }) => {
    await quoteStartPage.selectAiAdvisor();
    await expect(page).toHaveURL(/\/quote\/ai-advisor/);
  });

  test('2.4 - should navigate to Business Type page', async ({ page }) => {
    await quoteStartPage.selectPreConfigured();
    await expect(page).toHaveURL(/\/quote\/business-type/);
  });

  test('2.5 - should navigate to Upload page', async ({ page }) => {
    await quoteStartPage.selectUploadLicence();
    await expect(page).toHaveURL(/\/quote\/upload/);
  });

  test('2.6 - should navigate to Manual form page', async ({ page }) => {
    await quoteStartPage.selectFillManually();
    await expect(page).toHaveURL(/\/quote\/manual/);
  });
});
