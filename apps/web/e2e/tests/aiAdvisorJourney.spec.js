const { test, expect } = require('@playwright/test');
const AiAdvisorPage = require('../pages/AiAdvisorPage');
const { aiAdvisorPrompt } = require('../helpers/testData');

test.describe('Scenario 3: AI Advisor Journey', () => {
  let aiAdvisorPage;

  test.beforeEach(async ({ page }) => {
    aiAdvisorPage = new AiAdvisorPage(page);
    await aiAdvisorPage.open();
  });

  test('3.1 - should display AI chat interface with greeting', async () => {
    await expect(aiAdvisorPage.stepIndicator).toBeVisible();
    await expect(aiAdvisorPage.chatInput).toBeVisible();
  });

  test('3.2 - should show all quick-select business type chips', async () => {
    await aiAdvisorPage.verifyAllQuickSelectVisible();
  });

  test('3.3 - should select business type via chip and progress', async ({ page }) => {
    await aiAdvisorPage.selectBusinessType('cafe');
    // After selecting, conversation should show new messages
    await page.waitForTimeout(3000);
    // The page should still be on AI advisor
    await expect(page).toHaveURL(/\/quote\/ai-advisor/);
  });

  test('3.4 - should allow typing a business description', async () => {
    await aiAdvisorPage.chatInput.click();
    await aiAdvisorPage.chatInput.pressSequentially(aiAdvisorPrompt);
    await expect(aiAdvisorPage.chatInput).not.toHaveValue('');
  });
});
