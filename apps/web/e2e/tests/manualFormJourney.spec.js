const { test, expect } = require('@playwright/test');
const ManualFormPage = require('../pages/ManualFormPage');
const { validBusiness } = require('../helpers/testData');

test.describe('Scenario 5: Manual Form Journey', () => {
  let manualFormPage;

  test.beforeEach(async ({ page }) => {
    manualFormPage = new ManualFormPage(page);
    await manualFormPage.open();
  });

  test('5.1 - should display Step 1 heading and form', async () => {
    await expect(manualFormPage.pageHeading).toBeVisible();
    await manualFormPage.verifyFormFieldsVisible();
  });

  test('5.2 - should fill business description', async () => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    await expect(manualFormPage.businessDescriptionInput).toHaveValue(validBusiness.description);
  });

  test('5.3 - should enable classify button after entering description', async () => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    // Wait for classify button to become enabled
    await expect(manualFormPage.classifyButton).toBeEnabled({ timeout: 5000 });
  });

  test('5.4 - should classify business after entering description', async () => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    await expect(manualFormPage.classifyButton).toBeEnabled({ timeout: 5000 });
    await manualFormPage.clickClassify();
    // After classification, confirm button should appear
    await expect(manualFormPage.confirmClassificationBtn).toBeVisible({ timeout: 15000 });
  });

  test('5.5 - should display employee count options', async () => {
    await expect(manualFormPage.justMeButton).toBeVisible();
    await expect(manualFormPage.twoToFiveButton).toBeVisible();
    await expect(manualFormPage.sixToTwentyButton).toBeVisible();
  });

  test('5.6 - should display revenue band options (scroll to view)', async ({ page }) => {
    // Revenue bands may be below fold, scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(manualFormPage.revenueUnder500k).toBeVisible({ timeout: 5000 });
  });

  test('5.7 - should select employee count', async () => {
    await manualFormPage.selectEmployees('2-5');
  });

  test('5.8 - should select revenue band', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await manualFormPage.revenueUnder500k.waitFor({ state: 'visible', timeout: 5000 });
    await manualFormPage.selectRevenue('Under AED 500,000');
  });

  test('5.9 - should display Classify my business button', async () => {
    await expect(manualFormPage.classifyButton).toBeVisible();
  });

  test('5.10 - should display Continue button', async () => {
    await expect(manualFormPage.continueButton).toBeVisible();
  });

  test('5.11 - should advance to step 2 after confirming classification', async () => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    await expect(manualFormPage.classifyButton).toBeEnabled({ timeout: 5000 });
    await manualFormPage.clickClassify();
    await expect(manualFormPage.confirmClassificationBtn).toBeVisible({ timeout: 15000 });
    await manualFormPage.confirmClassification();
    await manualFormPage.selectEmployees('2-5');
    await manualFormPage.selectRevenue('Under AED 500,000');
    await manualFormPage.clickContinue();
    await expect(manualFormPage.getMyQuotesButton).toBeVisible({ timeout: 10000 });
  });

  test('5.12 - should navigate back from step 2 to step 1', async () => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    await expect(manualFormPage.classifyButton).toBeEnabled({ timeout: 5000 });
    await manualFormPage.clickClassify();
    await manualFormPage.confirmClassification();
    await manualFormPage.selectEmployees('2-5');
    await manualFormPage.selectRevenue('Under AED 500,000');
    await manualFormPage.clickContinue();
    await manualFormPage.backButton.click();
    await expect(manualFormPage.twoToFiveButton).toBeVisible();
    await expect(manualFormPage.continueButton).toBeVisible();
  });

  test('5.13 - should complete the manual flow and reach results', async ({ page }) => {
    await manualFormPage.fillBusinessDescription(validBusiness.description);
    await expect(manualFormPage.classifyButton).toBeEnabled({ timeout: 5000 });
    await manualFormPage.clickClassify();
    await manualFormPage.confirmClassification();
    await manualFormPage.selectEmployees('2-5');
    await manualFormPage.selectRevenue('Under AED 500,000');
    await manualFormPage.clickContinue();
    await manualFormPage.selectEmirate(validBusiness.emirate);
    await manualFormPage.selectCoverageArea('uae');
    await manualFormPage.clickGetMyQuotes();
    await expect(page).toHaveURL(/\/quote\/results/);
  });
});
