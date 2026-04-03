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

  test('4.6 - should toggle the IT detail panel open and closed', async () => {
    await businessTypePage.selectIT();
    await expect(businessTypePage.quickOverviewHeading).toBeVisible({ timeout: 5000 });
    await businessTypePage.selectIT();
    await expect(businessTypePage.quickOverviewHeading).toBeHidden();
  });

  test('4.7 - should route to manual flow when business type is not listed', async ({ page }) => {
    await page.getByRole('link', { name: /isn't listed|fill in manually/i }).click();
    await expect(page).toHaveURL(/\/quote\/manual/);
  });

  test('4.8 - should continue from a selected type to results', async ({ page }) => {
    await businessTypePage.selectIT();
    await businessTypePage.proceedWithSelectedType();
    await expect(page).toHaveURL(/\/quote\/results/);
  });
});
