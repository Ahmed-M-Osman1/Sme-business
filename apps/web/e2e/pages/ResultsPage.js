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

    // Annual / Monthly toggle
    this.annualToggle = page.getByRole('button', { name: /Annual/i });
    this.monthlyToggle = page.getByRole('button', { name: /Monthly/i });

    // Filters
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.shariahToggle = page.getByText(/Shariah/i);
    this.clearAllButton = page.getByText(/Clear all/i);

    // Sort
    this.sortDropdown = page.locator('select').filter({ hasText: /Lowest|Rating/i }).first();

    // Coverage limit pills (1M/2M/5M)
    this.limitPill1M = page.getByRole('button', { name: '1M' }).first();
    this.limitPill2M = page.getByRole('button', { name: '2M' }).first();
    this.limitPill5M = page.getByRole('button', { name: '5M' }).first();

    // Quote cards
    this.quoteCards = page.locator('[class*="rounded-2xl"][class*="border"]').filter({ hasText: /AED/i });

    // Quote card buttons (always visible even when collapsed)
    this.selectButtons = page.getByRole('button', { name: /^Select$/i });
    this.selectAndBuyButtons = page.getByRole('button', { name: /Select & Buy/i });

    // Best for badge
    this.bestForBadge = page.getByText(/Best for/i);

    // AI Insights panel
    this.aiInsightsHeader = page.getByText(/Shory AI Insights/i);
    this.addButtons = page.getByRole('button', { name: /\+ Add/i });
    this.addedButtons = page.getByRole('button', { name: /Added/i });

    // Mandatory covers
    this.requiredBadges = page.getByText(/Required/i);

    // Continue bar
    this.continueButton = page.getByRole('button', { name: /Continue/i });
    this.stickyBar = page.getByText(/Continue with/i);

    // Back
    this.backButton = page.getByRole('button', { name: /back/i });

    // No results
    this.noQuotesMessage = page.getByText(/No quotes/i);

    // Bundle cards
    this.bundleCards = page.locator('[class*="rounded-"]').filter({ hasText: /Starting from/i });
  }

  async open() {
    await this.navigateTo('/quote/results');
  }

  async waitForResultsLoaded(timeout = 30000) {
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

  async switchToMonthly() {
    await this.monthlyToggle.click();
  }

  async switchToAnnual() {
    await this.annualToggle.click();
  }

  async selectCoverageLimit(limit) {
    const pill = limit === '1M' ? this.limitPill1M : limit === '2M' ? this.limitPill2M : this.limitPill5M;
    await pill.click();
  }

  async expandFirstQuoteCard() {
    const firstCard = this.quoteCards.first();
    await firstCard.click();
    await this.page.waitForTimeout(400);
  }

  async clickFirstSelectAndBuy() {
    await this.selectAndBuyButtons.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectFirstQuote() {
    await this.selectButtons.first().click();
    await this.page.waitForTimeout(500);
  }

  async toggleAiInsights() {
    await this.aiInsightsHeader.click();
    await this.page.waitForTimeout(400);
  }

  async addFirstInsightExtra() {
    await this.addButtons.first().click();
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = ResultsPage;
