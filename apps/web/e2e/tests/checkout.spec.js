const { test, expect } = require('@playwright/test');
const CheckoutPage = require('../pages/CheckoutPage');
const { contactDetails, invalidContact } = require('../helpers/testData');

test.describe('Scenario 9: Checkout', () => {
  let checkoutPage;

  const checkoutUrl = '/quote/checkout?type=it-technology&source=manual&employees=2-5&insurer=salama&emirate=Dubai&products=workers-comp,public-liability&limits=%7B%7D';

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
    await checkoutPage.navigateTo(checkoutUrl);
  });

  test('9.1 - should display order summary with annual and monthly price', async () => {
    await expect(checkoutPage.orderSummary).toBeVisible();
    await expect(checkoutPage.totalPremium).toBeVisible();
    await expect(checkoutPage.annualPrice).toBeVisible();
    await expect(checkoutPage.monthlyPrice).toBeVisible();
  });

  test('9.2 - should display page heading and step indicator', async () => {
    await expect(checkoutPage.pageHeading).toBeVisible();
    await expect(checkoutPage.stepIndicator).toBeVisible();
  });

  test('9.3 - should display all 4 payment methods', async () => {
    await expect(checkoutPage.applePayMethod).toBeVisible();
    await expect(checkoutPage.finwallMethod).toBeVisible();
    await expect(checkoutPage.cardMethod).toBeVisible();
    await expect(checkoutPage.bankMethod).toBeVisible();
  });

  test('9.4 - should display security badges', async () => {
    await expect(checkoutPage.securityBadges).toBeVisible();
  });

  test('9.5 - should show card form when Card Payment selected', async () => {
    await checkoutPage.selectPaymentMethod('card');
    await expect(checkoutPage.cardNumberInput).toBeVisible();
    await expect(checkoutPage.cardExpiryInput).toBeVisible();
    await expect(checkoutPage.cardCvvInput).toBeVisible();
  });

  test('9.6 - should show bank details when Bank Transfer selected', async ({ page }) => {
    await checkoutPage.selectPaymentMethod('bank_transfer');
    await expect(page.getByText(/Emirates NBD/i)).toBeVisible();
    await expect(page.getByText(/IBAN/i)).toBeVisible();
  });

  test('9.7 - should show Finwall T&Cs when Monthly Instalments selected', async ({ page }) => {
    await checkoutPage.selectPaymentMethod('finwall');
    await expect(page.getByText(/0%.*interest/i)).toBeVisible();
    await expect(page.getByText(/Finwall Terms/i)).toBeVisible();
  });

  test('9.8 - Pay button disabled without declaration checkbox', async () => {
    await expect(checkoutPage.payButton).toBeDisabled();
  });

  test('9.9 - Pay button enabled after checking declaration', async () => {
    await checkoutPage.checkDeclaration();
    await expect(checkoutPage.payButton).toBeEnabled();
  });

  test('9.10 - should validate card fields when Card selected', async ({ page }) => {
    await checkoutPage.selectPaymentMethod('card');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.click();
    await nameInput.pressSequentially(contactDetails.fullName, { delay: 10 });
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.click();
    await emailInput.pressSequentially(contactDetails.email, { delay: 10 });
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.click();
    await phoneInput.pressSequentially(contactDetails.phone, { delay: 10 });
    await checkoutPage.checkDeclaration();
    await checkoutPage.clickPay();
    await expect(checkoutPage.cardNumError).toBeVisible();
    await expect(checkoutPage.cardCvvError).toBeVisible();
  });

  test('9.11 - should show validation errors for empty contact form', async () => {
    await checkoutPage.checkDeclaration();
    await checkoutPage.clickPay();
    await expect(checkoutPage.nameError).toBeVisible();
    await expect(checkoutPage.emailError).toBeVisible();
    await expect(checkoutPage.phoneError).toBeVisible();
  });
});
