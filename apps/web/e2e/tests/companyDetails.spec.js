const { test, expect } = require('@playwright/test');
const CompanyDetailsPage = require('../pages/CompanyDetailsPage');
const { companyDetails } = require('../helpers/testData');

test.describe('Scenario 8: Company Details', () => {
  let companyDetailsPage;

  const companyUrl = '/quote/company-details?type=it-technology&source=manual&employees=2-5&insurer=oman-insurance&emirate=Dubai';
  const prefilledCompanyUrl = '/quote/company-details?type=it-technology&source=manual&employees=2-5&insurer=oman-insurance&emirate=Dubai&businessName=Tech%20Solutions%20LLC&licenseNumber=DXB-2024-123456&prefilled=true';

  test.beforeEach(async ({ page }) => {
    companyDetailsPage = new CompanyDetailsPage(page);
    await companyDetailsPage.navigateTo(companyUrl);
    await companyDetailsPage.waitForPageReady();
  });

  test('8.1 - should display company details page', async () => {
    await expect(companyDetailsPage.pageHeading).toBeVisible();
  });

  test('8.2 - should show the two entry paths on the choice screen', async ({ page }) => {
    await expect(companyDetailsPage.uploadZone).toBeVisible();
    await expect(page.getByText(/Enter details manually|Enter manually/i).first()).toBeVisible();
  });

  test('8.3 - should display upload zone for trade licence', async () => {
    await expect(companyDetailsPage.uploadZone).toBeVisible();
  });

  test('8.4 - should display step indicator', async () => {
    await expect(companyDetailsPage.stepIndicator).toBeVisible();
  });

  test('8.5 - should open manual entry form from the choice screen', async () => {
    await companyDetailsPage.clickManualEntry();
    await expect(companyDetailsPage.verifyButton).toBeVisible();
    await expect(companyDetailsPage.companyNameInput).toBeVisible();
    await expect(companyDetailsPage.licenseNumberInput).toBeVisible();
  });

  test('8.6 - should validate required fields in manual mode', async () => {
    await companyDetailsPage.clickManualEntry();
    await companyDetailsPage.clickVerify();
    await expect(companyDetailsPage.verifyButton).toBeVisible();
    await expect(companyDetailsPage.continueButton).not.toBeVisible();
    await expect(companyDetailsPage.companyNameInput).toBeVisible();
    await expect(companyDetailsPage.licenseNumberInput).toBeVisible();
  });

  test('8.7 - should verify manual company details and unlock continue', async ({ page }) => {
    await companyDetailsPage.clickManualEntry();
    await companyDetailsPage.fillCompanyName(companyDetails.companyName);
    await companyDetailsPage.fillLicenseNumber(companyDetails.licenseNumber);
    await companyDetailsPage.fillExpiryDate(companyDetails.expiryDate);
    await companyDetailsPage.clickVerify();

    await expect(page.getByText(companyDetails.companyName).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Re-upload document/i })).toBeVisible();
  });

  test('8.8 - should continue to checkout after manual verification', async ({ page }) => {
    await companyDetailsPage.clickManualEntry();
    await companyDetailsPage.fillCompanyName(companyDetails.companyName);
    await companyDetailsPage.fillLicenseNumber(companyDetails.licenseNumber);
    await companyDetailsPage.fillExpiryDate(companyDetails.expiryDate);
    await companyDetailsPage.clickVerify();
    await companyDetailsPage.clickContinue();
    await expect(page).toHaveURL(/\/quote\/checkout/);
  });

  test('8.9 - should render prefilled company details in confirmed mode', async ({ page }) => {
    await companyDetailsPage.navigateTo(prefilledCompanyUrl);
    await companyDetailsPage.waitForPageReady();
    await expect(page.getByText(/From trade license|Extracted from trade license/i).first()).toBeVisible();
    await expect(page.getByText(/Tech Solutions LLC/i).first()).toBeVisible();
    await expect(companyDetailsPage.continueButton).toBeVisible();
  });
});
