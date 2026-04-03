const { test, expect } = require('@playwright/test');
const ConfirmationPage = require('../pages/ConfirmationPage');

test.describe('Scenario 10: Confirmation', () => {
  let confirmationPage;

  const confirmUrl = '/quote/confirmation?type=it-technology&insurer=oman-insurance&emirate=Dubai&email=test@example.com&name=Ahmed&phone=501234567&products=property,liability';

  test.beforeEach(async ({ page }) => {
    confirmationPage = new ConfirmationPage(page);
    await confirmationPage.navigateTo(confirmUrl);
  });

  test('10.1 - should display success heading', async () => {
    await expect(confirmationPage.successHeading).toBeVisible();
  });

  test('10.2 - should display policy number', async () => {
    await expect(confirmationPage.policyNumber).toBeVisible();
  });

  test('10.3 - should display Active badge', async () => {
    await expect(confirmationPage.activeBadge).toBeVisible();
  });

  test('10.4 - should display policy details section', async ({ page }) => {
    // Verify the POLICY section with number, dates, risk level
    await expect(page.getByText(/POLICY NUMBER/i)).toBeVisible();
    await expect(page.getByText(/EFFECTIVE DATE/i)).toBeVisible();
  });

  test('10.5 - should display start new quote link', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(confirmationPage.startNewQuoteLink).toBeVisible({ timeout: 5000 });
  });

  test('10.6 - should navigate to quote start via Start new quote', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await confirmationPage.startNewQuoteLink.waitFor({ state: 'visible', timeout: 5000 });
    await confirmationPage.clickStartNewQuote();
    await expect(page).toHaveURL(/\/quote\/start/);
  });
});
