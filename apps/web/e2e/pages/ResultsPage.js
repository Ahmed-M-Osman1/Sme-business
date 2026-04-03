const BasePage = require('./BasePage');

class ResultsPage extends BasePage {
  constructor(page) {
    super(page);

    // Loading state
    this.loadingIndicator = page.getByText(/Finding the best quotes/i);

    // Page heading
    this.resultsHeading = page.getByRole('heading').first();

    // Tabs
    this.individualTab = page.getByRole('button', { name: /Individual/i });
    this.bundleTab = page.getByRole('button', { name: /Bundle/i });

    // Filters
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.shariahToggle = page.getByText(/Shariah/i);
    this.clearAllButton = page.getByText(/Clear all/i);

    // Sort
    this.sortDropdown = page.getByRole('button', { name: /sort|lowest|rating/i }).first();

    // Quote cards
    this.quoteCards = page.locator('[class*="card"]').filter({ hasText: /AED/i });

    // Continue bar
    this.continueButton = page.getByRole('button', { name: /Continue/i });
    this.stickyBar = page.getByText(/Continue with/i);

    // Back
    this.backButton = page.getByRole('button', { name: /back/i });

    // No results
    this.noQuotesMessage = page.getByText(/No quotes/i);
  }

  async open() {
    await this.navigateTo('/quote/results');
  }

  async waitForResultsLoaded(timeout = 30000) {
    // Wait for loading to disappear or for quote cards to appear
    try {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
    } catch {
      // Loading may have already passed
    }
  }

  async isLoadingVisible() {
    return await this.loadingIndicator.isVisible();
  }

  async clickIndividualTab() {
    await this.individualTab.click();
  }

  async clickBundleTab() {
    await this.bundleTab.click();
  }

  async selectFirstQuote() {
    const firstCard = this.quoteCards.first();
    await firstCard.click();
    await this.page.waitForTimeout(500);
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = ResultsPage;
