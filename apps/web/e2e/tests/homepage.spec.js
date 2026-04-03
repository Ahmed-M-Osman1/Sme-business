const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('Scenario 1: Homepage & Navigation', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.open();
  });

  test('1.1 - should display hero section with heading', async () => {
    await expect(homePage.heroHeading).toBeVisible();
  });

  test('1.2 - should display SME Business Insurance card', async () => {
    await expect(homePage.smeBusinessInsuranceCard).toBeVisible();
    await expect(homePage.getAQuoteButton).toBeVisible();
  });

  test('1.3 - should navigate to quote start when clicking Get a quote', async ({ page }) => {
    await homePage.clickGetAQuote();
    await expect(page).toHaveURL(/\/quote\/start/);
  });

  test('1.4 - should display navigation elements', async () => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.languageToggle).toBeVisible();
  });

  test('1.5 - should display trust indicators', async () => {
    await expect(homePage.trustBadge).toBeVisible();
  });

  test('1.6 - should navigate to quote start from the secondary CTA', async ({ page }) => {
    await homePage.clickGetStarted();
    await expect(page).toHaveURL(/\/quote\/start/);
  });

  test('1.7 - should expose primary navigation links', async () => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.getAQuoteButton).toBeVisible();
    await expect(homePage.statsSection).toBeVisible();
  });
});
