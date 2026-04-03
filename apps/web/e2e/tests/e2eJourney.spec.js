const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const QuoteStartPage = require('../pages/QuoteStartPage');
const AiAdvisorPage = require('../pages/AiAdvisorPage');
const ManualFormPage = require('../pages/ManualFormPage');
const BusinessTypePage = require('../pages/BusinessTypePage');
const UploadLicencePage = require('../pages/UploadLicencePage');

test.describe('Scenario 11: Full E2E Journeys', () => {

  test('11.1 - Homepage → Quote Start → AI Advisor flow', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.clickGetAQuote();
    await expect(page).toHaveURL(/\/quote\/start/);

    const quoteStartPage = new QuoteStartPage(page);
    await quoteStartPage.selectAiAdvisor();
    await expect(page).toHaveURL(/\/quote\/ai-advisor/);

    const aiAdvisorPage = new AiAdvisorPage(page);
    await expect(aiAdvisorPage.chatInput).toBeVisible();
    await aiAdvisorPage.verifyAllQuickSelectVisible();
  });

  test('11.2 - Homepage → Quote Start → Manual Form flow', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.clickGetAQuote();
    await expect(page).toHaveURL(/\/quote\/start/);

    const quoteStartPage = new QuoteStartPage(page);
    await quoteStartPage.selectFillManually();
    await expect(page).toHaveURL(/\/quote\/manual/);

    const manualFormPage = new ManualFormPage(page);
    await expect(manualFormPage.pageHeading).toBeVisible();
    await manualFormPage.verifyFormFieldsVisible();
  });

  test('11.3 - Homepage → Quote Start → Business Type flow', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.clickGetAQuote();
    await expect(page).toHaveURL(/\/quote\/start/);

    const quoteStartPage = new QuoteStartPage(page);
    await quoteStartPage.selectPreConfigured();
    await expect(page).toHaveURL(/\/quote\/business-type/);

    const businessTypePage = new BusinessTypePage(page);
    await expect(businessTypePage.pageHeading).toBeVisible();
    await expect(businessTypePage.cafeCard).toBeVisible();
  });

  test('11.4 - Cross-method navigation: Quote Start → Upload → verify page', async ({ page }) => {
    const quoteStartPage = new QuoteStartPage(page);
    await quoteStartPage.open();
    await quoteStartPage.selectUploadLicence();
    await expect(page).toHaveURL(/\/quote\/upload/);

    const uploadPage = new UploadLicencePage(page);
    await expect(uploadPage.dropZone).toBeVisible();
    await expect(uploadPage.tryAiAdvisorLink).toBeVisible();
  });
});
