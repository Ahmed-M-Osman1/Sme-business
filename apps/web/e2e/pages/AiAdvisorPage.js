const BasePage = require('./BasePage');

class AiAdvisorPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 2 of 6/i);

    // Chat interface
    this.chatInput = page.getByRole('textbox').first();
    this.sendButton = page.locator('button[aria-label]').filter({ has: page.locator('svg') }).last();

    // AI greeting
    this.aiGreeting = page.getByText(/I'm your Shory insurance advisor/i);

    // Quick-select business type chips
    this.cafeChip = page.getByRole('button', { name: /Caf[eé].*Restaurant/i });
    this.lawFirmChip = page.getByRole('button', { name: /Law Firm/i });
    this.retailChip = page.getByRole('button', { name: /Retail.*Trading/i });
    this.itChip = page.getByRole('button', { name: /IT.*Technology/i });
    this.constructionChip = page.getByRole('button', { name: /Construction/i });
    this.healthcareChip = page.getByRole('button', { name: /Healthcare/i });
    this.consultingChip = page.getByRole('button', { name: /Consulting/i });
    this.generalTradingChip = page.getByRole('button', { name: /General Trading/i });
    this.logisticsChip = page.getByRole('button', { name: /Logistics/i });
    this.realEstateChip = page.getByRole('button', { name: /Real Estate/i });

    // Conversational step chips (appear after business selection)
    this.employeeChips = page.locator('button[aria-label]');
    this.revenueChips = page.locator('button[aria-label]');
    this.emirateChips = page.locator('button[aria-label]');

    // CTA
    this.seeMyQuotesButton = page.getByRole('button', { name: /See my quotes/i });

    // Fallback links
    this.quickSelectFallback = page.getByRole('button', { name: /Quick Select/i });
    this.manualEntryFallback = page.getByRole('button', { name: /Manual Entry/i });

    // Quick select map
    this.quickSelectButtons = {
      'cafe': this.cafeChip,
      'law': this.lawFirmChip,
      'retail': this.retailChip,
      'it': this.itChip,
      'construction': this.constructionChip,
      'healthcare': this.healthcareChip,
      'consulting': this.consultingChip,
      'general': this.generalTradingChip,
      'logistics': this.logisticsChip,
      'realestate': this.realEstateChip,
    };
  }

  async open() {
    await this.navigateTo('/quote/ai-advisor');
  }

  async selectBusinessType(type) {
    const chip = this.quickSelectButtons[type.toLowerCase()];
    if (chip) {
      await chip.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async selectEmployeeChip(label) {
    await this.page.getByRole('button', { name: new RegExp(label, 'i') }).click();
    await this.page.waitForTimeout(1000);
  }

  async selectRevenueChip(label) {
    await this.page.getByRole('button', { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
    await this.page.waitForTimeout(1000);
  }

  async selectEmirateChip(label) {
    await this.page.getByRole('button', { name: new RegExp(label, 'i') }).click();
    await this.page.waitForTimeout(1000);
  }

  async typeBusinessDescription(text) {
    await this.chatInput.click();
    await this.chatInput.fill(text);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async clickSeeMyQuotes() {
    await this.seeMyQuotesButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyAllQuickSelectVisible() {
    for (const chip of Object.values(this.quickSelectButtons)) {
      await chip.waitFor({ state: 'visible', timeout: 10000 });
    }
  }
}

module.exports = AiAdvisorPage;
