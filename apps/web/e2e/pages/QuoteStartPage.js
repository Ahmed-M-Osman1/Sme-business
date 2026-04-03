const BasePage = require('./BasePage');

class QuoteStartPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 1 of 6/i);

    // Method selection cards
    this.aiAdvisorCard = page.getByRole('link', { name: /AI Advisor/i });
    this.preConfiguredCard = page.getByRole('link', { name: /pre-configured/i });
    this.uploadLicenceCard = page.getByRole('link', { name: /Upload trade licence/i });
    this.fillManuallyCard = page.getByRole('link', { name: /Fill in manually/i });

    // Badges
    this.recommendedBadge = page.getByText(/recommended/i).first();
    this.fastestBadge = page.getByText(/fastest/i).first();
  }

  async open() {
    await this.navigateTo('/quote/start');
  }

  async selectAiAdvisor() {
    await this.aiAdvisorCard.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectPreConfigured() {
    await this.preConfiguredCard.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectUploadLicence() {
    await this.uploadLicenceCard.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectFillManually() {
    await this.fillManuallyCard.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyAllOptionsVisible() {
    await this.aiAdvisorCard.waitFor({ state: 'visible' });
    await this.preConfiguredCard.waitFor({ state: 'visible' });
    await this.uploadLicenceCard.waitFor({ state: 'visible' });
    await this.fillManuallyCard.waitFor({ state: 'visible' });
  }
}

module.exports = QuoteStartPage;
