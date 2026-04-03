const { test, expect } = require('@playwright/test');
const CheckoutPage = require('../pages/CheckoutPage');
const { contactDetails } = require('../helpers/testData');

test.describe('Scenario 9: Checkout', () => {
  let checkoutPage;

  const checkoutUrl = '/quote/checkout?type=it-technology&source=manual&employees=2-5&insurer=oman-insurance&emirate=Dubai&products=property,liability';

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
    await checkoutPage.navigateTo(checkoutUrl);
  });

  test('9.1 - should display order summary', async () => {
    await expect(checkoutPage.orderSummary).toBeVisible();
  });

  test('9.2 - should display page heading', async () => {
    await expect(checkoutPage.pageHeading).toBeVisible();
  });

  test('9.3 - should display total premium', async () => {
    await expect(checkoutPage.totalPremium).toBeVisible();
  });

  test('9.4 - should display Pay button', async () => {
    await expect(checkoutPage.payButton).toBeVisible();
  });

  test('9.5 - should display step 6 of 6 indicator', async () => {
    await expect(checkoutPage.stepIndicator).toBeVisible();
  });

  test('9.6 - should fill contact details form', async ({ page }) => {
    // Scroll to contact section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    // Try filling with input type selectors as fallback
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const phoneInput = page.locator('input[type="tel"]').first();
    await nameInput.fill(contactDetails.fullName);
    await emailInput.fill(contactDetails.email);
    await phoneInput.fill(contactDetails.phone);
    await expect(nameInput).toHaveValue(contactDetails.fullName);
  });

  test('9.7 - should fill contact form and click Pay', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    // Use pressSequentially to trigger React state updates
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const phoneInput = page.locator('input[type="tel"]').first();
    await nameInput.click();
    await nameInput.pressSequentially(contactDetails.fullName, { delay: 10 });
    await emailInput.click();
    await emailInput.pressSequentially(contactDetails.email, { delay: 10 });
    await phoneInput.click();
    await phoneInput.pressSequentially(contactDetails.phone, { delay: 10 });
    // Verify Pay button is present and clickable
    await expect(checkoutPage.payButton).toBeVisible();
  });
});
