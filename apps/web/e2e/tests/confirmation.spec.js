const { test, expect } = require('@playwright/test');
const ConfirmationPage = require('../pages/ConfirmationPage');

test.describe('Scenario 10: Confirmation', () => {
  let confirmationPage;

  const confirmUrl = '/quote/confirmation?type=it-technology&insurer=salama&emirate=Dubai&email=test@example.com&name=Ahmed&phone=501234567&products=workers-comp,public-liability&total=1800&limits=%7B%7D&payMethod=card';

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

  test('10.4 - should display payment method confirmation', async ({ page }) => {
    await expect(page.getByText(/authorised|activated/i).first()).toBeVisible();
  });

  test('10.5 - should display policy details section', async ({ page }) => {
    await expect(page.getByText(/Policy number/i).first()).toBeVisible();
    await expect(page.getByText(/Effective date/i).first()).toBeVisible();
  });

  test('10.6 - should display coverage and premium summary', async () => {
    await expect(confirmationPage.coverageSection).toBeVisible();
    await expect(confirmationPage.page.getByText(/Total Annual Premium/i).first()).toBeVisible();
  });

  test('10.7 - should display value delivered metrics', async () => {
    await expect(confirmationPage.valueDelivered).toBeVisible();
    await expect(confirmationPage.timeSaved).toBeVisible();
  });

  test('10.8 - should display download actions', async () => {
    await expect(confirmationPage.page.getByRole('button', { name: /Policy Certificate/i })).toBeVisible();
    await expect(confirmationPage.page.getByRole('button', { name: /^Invoice$/i })).toBeVisible();
  });

  test('10.9 - should display WhatsApp share button', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(confirmationPage.whatsappShareButton).toBeVisible();
  });

  test('10.10 - should display feedback rating section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(confirmationPage.feedbackSection).toBeVisible();
    await expect(confirmationPage.starButtons.first()).toBeVisible();
  });

  test('10.11 - should allow rating feedback with stars', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await confirmationPage.rateFeedback(4);
    await expect(confirmationPage.submitFeedback).toBeVisible();
  });

  test('10.12 - should display referral card', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(confirmationPage.referralCard).toBeVisible();
    await expect(confirmationPage.copyReferralButton).toBeVisible();
  });

  test('10.13 - should display support section', async () => {
    await expect(confirmationPage.supportSection).toBeVisible();
  });

  test('10.14 - should display start new quote link', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(confirmationPage.startNewQuoteLink).toBeVisible({ timeout: 5000 });
  });
});
