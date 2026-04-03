const BasePage = require('./BasePage');

class ConfirmationPage extends BasePage {
  constructor(page) {
    super(page);

    // Success heading
    this.successHeading = page.getByRole('heading').first();

    // Policy details
    this.policyNumber = page.locator('text=/SHR-/').first();
    this.activeBadge = page.getByText(/\bActive\b/).first();

    // Coverage section
    this.coverageSection = page.getByText(/Coverage/i).first();
    this.totalPremium = page.getByText(/Total premium/i);

    // Download buttons
    this.downloadPdfButton = page.getByRole('button', { name: /Download PDF/i });
    this.downloadInvoiceButton = page.getByRole('button', { name: /Download Invoice/i });

    // Support section
    this.supportSection = page.getByText(/support/i).first();

    // Start new quote
    this.startNewQuoteLink = page.getByRole('link', { name: /start.*new.*quote/i });
  }

  async open() {
    await this.navigateTo('/quote/confirmation');
  }

  async isConfirmed() {
    return await this.successHeading.isVisible().catch(() => false);
  }

  async clickStartNewQuote() {
    await this.startNewQuoteLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = ConfirmationPage;
