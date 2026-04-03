const BasePage = require('./BasePage');

class ManualFormPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicators
    this.stepIndicator = page.getByText(/Step 2 of 6/i);
    this.subStep1Indicator = page.getByText(/Step 1 of 2/i);
    this.subStep2Indicator = page.getByText(/Step 2 of 2/i);

    // Page heading
    this.pageHeading = page.getByRole('heading', { name: /Tell us about your business/i });

    // Step 1: Business classification
    this.businessDescriptionInput = page.getByPlaceholder(/Caf/i);
    this.classifyButton = page.getByRole('button', { name: /Classify my business/i });
    this.confirmClassificationBtn = page.getByRole('button', { name: /yes.*right|that.*right/i });
    this.changeClassificationBtn = page.getByRole('button', { name: /change it/i });

    // Employee count buttons
    this.justMeButton = page.getByRole('button', { name: /Just me/i });
    this.twoToFiveButton = page.getByRole('button', { name: /2.5/i });
    this.sixToTwentyButton = page.getByRole('button', { name: /6.20/i });
    this.twentyOneToFiftyButton = page.getByRole('button', { name: /21.50/i });
    this.fiftyOneToHundredButton = page.getByRole('button', { name: /51.100/i });
    this.hundredPlusButton = page.getByRole('button', { name: /100\+/i });

    // Revenue buttons
    this.revenueUnder500k = page.getByRole('button', { name: 'Under AED 500,000' });
    this.revenue500kTo1M = page.getByRole('button', { name: /AED 500K/i });
    this.revenue1MTo5M = page.getByRole('button', { name: /AED 1M.*5/i });
    this.revenue5MTo10M = page.getByRole('button', { name: /AED 5M.*10/i });
    this.revenueOver10M = page.getByRole('button', { name: /Over AED 10 million/i });

    // Continue button
    this.continueButton = page.getByRole('button', { name: /Continue/i });

    // Step 2: Location & coverage
    this.emirateSelect = page.getByRole('combobox').first();
    this.coverageAreaSelect = page.getByRole('combobox').nth(1);
    this.getMyQuotesButton = page.getByRole('button', { name: /get my quotes/i });
    this.backButton = page.getByRole('button', { name: /back/i });
  }

  async open() {
    await this.navigateTo('/quote/manual');
  }

  async fillBusinessDescription(text) {
    await this.businessDescriptionInput.click();
    await this.businessDescriptionInput.fill('');
    await this.businessDescriptionInput.pressSequentially(text, { delay: 20 });
  }

  async clickClassify() {
    await this.classifyButton.click();
    await this.page.waitForTimeout(2000);
  }

  async confirmClassification() {
    await this.confirmClassificationBtn.click();
    await this.page.waitForTimeout(500);
  }

  async selectEmployees(option) {
    const buttonMap = {
      'Just me': this.justMeButton,
      '2-5': this.twoToFiveButton,
      '6-20': this.sixToTwentyButton,
      '21-50': this.twentyOneToFiftyButton,
      '51-100': this.fiftyOneToHundredButton,
      '100+': this.hundredPlusButton,
    };
    const button = buttonMap[option];
    if (button) await button.click();
  }

  async selectRevenue(option) {
    const buttonMap = {
      'Under AED 500,000': this.revenueUnder500k,
      'AED 500K – 1 million': this.revenue500kTo1M,
      'AED 1M – 5 million': this.revenue1MTo5M,
      'AED 5M – 10 million': this.revenue5MTo10M,
      'Over AED 10 million': this.revenueOver10M,
    };
    const button = buttonMap[option];
    if (button) await button.click();
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectEmirate(emirate) {
    await this.emirateSelect.selectOption(emirate);
  }

  async selectCoverageArea(area) {
    await this.coverageAreaSelect.selectOption(area);
  }

  async clickGetMyQuotes() {
    await this.getMyQuotesButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyFormFieldsVisible() {
    await this.businessDescriptionInput.waitFor({ state: 'visible' });
    await this.classifyButton.waitFor({ state: 'visible' });
  }
}

module.exports = ManualFormPage;
