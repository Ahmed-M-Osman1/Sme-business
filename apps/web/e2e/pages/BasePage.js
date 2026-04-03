class BasePage {
  constructor(page) {
    this.page = page;

    // Header elements
    this.logo = page.locator('a[href="/"]').first();
    this.navPersonal = page.getByRole('link', { name: /personal/i }).first();
    this.navBusiness = page.getByRole('link', { name: /business/i }).first();
    this.navCompany = page.getByRole('link', { name: /company/i }).first();
    this.navHelp = page.getByRole('link', { name: /help/i }).first();
    this.languageToggle = page.getByText(/عربي/i).first();
  }

  async navigateTo(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = BasePage;
