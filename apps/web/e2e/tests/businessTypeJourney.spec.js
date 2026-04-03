const { test, expect } = require('@playwright/test');
const BusinessTypePage = require('../pages/BusinessTypePage');

test.describe('Scenario 4: Pre-configured Business Type', () => {
  let businessTypePage;

  test.beforeEach(async ({ page }) => {
    businessTypePage = new BusinessTypePage(page);
    await businessTypePage.open();
  });

  test('4.1 - should display business type page heading', async () => {
    await expect(businessTypePage.pageHeading).toBeVisible();
  });

  test('4.2 - should show featured types (Cafe, Retail, IT)', async () => {
    await expect(businessTypePage.cafeCard).toBeVisible();
    await expect(businessTypePage.retailCard).toBeVisible();
    await expect(businessTypePage.itCard).toBeVisible();
  });

  test('4.3 - should display all business type cards', async () => {
    await expect(businessTypePage.lawCard).toBeVisible();
    await expect(businessTypePage.constructionCard).toBeVisible();
    await expect(businessTypePage.healthcareCard).toBeVisible();
  });

  test('4.4 - should select a business type and show detail panel', async () => {
    await businessTypePage.selectIT();
    // Quick overview should appear after selection
    await expect(businessTypePage.quickOverviewHeading).toBeVisible({ timeout: 5000 });
  });

  test('4.5 - should display step 2 of 6 indicator', async () => {
    await expect(businessTypePage.stepIndicator).toBeVisible();
  });
});
