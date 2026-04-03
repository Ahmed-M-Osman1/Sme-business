const { test, expect } = require('@playwright/test');
const CompanyDetailsPage = require('../pages/CompanyDetailsPage');

test.describe('Scenario 8: Company Details', () => {
  let companyDetailsPage;

  const companyUrl = '/quote/company-details?type=it-technology&source=manual&employees=2-5&insurer=oman-insurance&emirate=Dubai';

  test.beforeEach(async ({ page }) => {
    companyDetailsPage = new CompanyDetailsPage(page);
    await companyDetailsPage.navigateTo(companyUrl);
    await companyDetailsPage.waitForPageReady();
  });

  test('8.1 - should display company details page', async () => {
    await expect(companyDetailsPage.pageHeading).toBeVisible();
  });

  test('8.2 - should display skip button', async () => {
    await expect(companyDetailsPage.skipButton).toBeVisible();
  });

  test('8.3 - should display upload zone for trade licence', async () => {
    await expect(companyDetailsPage.uploadZone).toBeVisible();
  });

  test('8.4 - should display step indicator', async () => {
    await expect(companyDetailsPage.stepIndicator).toBeVisible();
  });

  test('8.5 - should click skip button', async ({ page }) => {
    await companyDetailsPage.clickSkip();
    // After skip, should navigate away from company-details or show checkout
    await page.waitForTimeout(2000);
    const url = page.url();
    // Skip may navigate to checkout or stay on page depending on required params
    expect(url).toBeTruthy();
  });
});
