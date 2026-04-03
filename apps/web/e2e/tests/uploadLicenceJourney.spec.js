const { test, expect } = require('@playwright/test');
const UploadLicencePage = require('../pages/UploadLicencePage');

test.describe('Scenario 6: Upload Trade Licence', () => {
  let uploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadLicencePage(page);
    await uploadPage.open();
  });

  test('6.1 - should display upload drop zone', async () => {
    await uploadPage.verifyDropZoneVisible();
  });

  test('6.2 - should display accepted file formats', async () => {
    await expect(uploadPage.acceptedFormatsText).toBeVisible();
  });

  test('6.3 - should display What happens next section', async () => {
    await expect(uploadPage.whatHappensNext).toBeVisible();
  });

  test('6.4 - should display alternative path links', async () => {
    await expect(uploadPage.tryAiAdvisorLink).toBeVisible();
  });

  test('6.5 - should display Try AI Advisor alternative link', async () => {
    await expect(uploadPage.tryAiAdvisorLink).toBeVisible();
  });

  test('6.6 - should display browse files link', async () => {
    await expect(uploadPage.browseFilesLink).toBeVisible();
  });
});
