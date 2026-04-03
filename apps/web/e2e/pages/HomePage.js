const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // Hero section
    this.heroHeading = page.getByRole('heading', { name: /top insurers/i }).first();

    // Navigation links
    this.personalLink = page.getByRole('link', { name: /personal/i }).first();
    this.businessLink = page.getByRole('link', { name: /business/i }).first();

    // Tabs
    this.personalTab = page.getByRole('button', { name: /personal/i }).first();
    this.businessTab = page.getByRole('button', { name: /business/i }).first();

    // SME Business Insurance
    this.smeBusinessInsuranceCard = page.getByText(/SME Business Insurance/i).first();
    this.getAQuoteButton = page.getByRole('link', { name: /get a quote/i }).first();
    this.getStartedButton = page.getByRole('link', { name: /get started/i }).first();

    // Trust indicators
    this.trustBadge = page.getByText(/reviews/i).first();
    this.statsSection = page.getByText(/insured/i).first();
  }

  async open() {
    await this.navigateTo('/');
  }

  async clickGetAQuote() {
    await this.getAQuoteButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = HomePage;
