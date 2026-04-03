const BasePage = require('./BasePage');

class BusinessTypePage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 2 of 6/i);

    // Page heading
    this.pageHeading = page.getByRole('heading', { name: /what type of business/i });

    // Business type cards (buttons)
    this.cafeCard = page.locator('button').filter({ hasText: 'Café / Restaurant' });
    this.retailCard = page.locator('button').filter({ hasText: 'Retail / Trading' });
    this.itCard = page.locator('button').filter({ hasText: 'IT / Technology' });
    this.lawCard = page.locator('button').filter({ hasText: 'Law Firm / Legal' });
    this.constructionCard = page.locator('button').filter({ hasText: 'Construction / Contracting' });
    this.healthcareCard = page.locator('button').filter({ hasText: 'Healthcare / Clinic' });
    this.consultingCard = page.locator('button').filter({ hasText: 'Consulting / Advisory' });
    this.generalTradingCard = page.locator('button').filter({ hasText: 'General Trading' });
    this.logisticsCard = page.locator('button').filter({ hasText: 'Logistics / Transport' });
    this.realEstateCard = page.locator('button').filter({ hasText: 'Real Estate' });

    // Quick Overview panel (appears after selecting a card)
    this.quickOverviewHeading = page.getByText(/quick overview/i);

    // Employee/coverage range selectors in the Quick Overview panel
    this.emirateSelect = page.getByRole('combobox').first();
    this.coverageAreaSelect = page.getByRole('combobox').nth(1);

    // Proceed button - sticky footer after selection
    this.getQuotesButton = page.getByRole('button', { name: /get.*quotes|continue/i }).last();
  }

  async open() {
    await this.navigateTo('/quote/business-type');
  }

  async selectBusinessType(card) {
    await card.waitFor({ state: 'visible' });
    await card.click();
    await this.page.waitForTimeout(800);
  }

  async selectCafe() { await this.selectBusinessType(this.cafeCard); }
  async selectRetail() { await this.selectBusinessType(this.retailCard); }
  async selectIT() { await this.selectBusinessType(this.itCard); }

  async proceedWithSelectedType() {
    // After clicking a card, look for enabled proceed/continue button in sticky footer
    const footer = this.page.locator('button:not([disabled])').filter({ hasText: /get.*quotes|continue/i }).last();
    await footer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const isVisible = await footer.isVisible().catch(() => false);
    if (isVisible) {
      await footer.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
}

module.exports = BusinessTypePage;
