const BasePage = require('./BasePage');

class CompanyDetailsPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 5 of 6/i);

    // Page heading
    this.pageHeading = page.getByRole('heading').first();

    // Choice mode
    this.uploadZone = page.getByText(/drop.*licen[cs]e|drag.*drop/i).first();
    this.manualEntryCard = page.getByRole('button', { name: /Enter details manually/i });
    this.mandatoryNotice = page.getByText(/Trade license verification is required/i);

    // Manual form fields
    this.companyNameInput = page.locator('input:not([type="hidden"])').first();
    this.licenseNumberInput = page.locator('input:not([type="hidden"])').nth(1);
    this.activityDropdown = page.getByRole('combobox').first();
    this.expiryDateInput = page.getByPlaceholder(/DD\/MM\/YYYY/i);
    this.emirateDropdown = page.getByRole('combobox').last();

    // Buttons
    this.verifyButton = page.getByRole('button', { name: /Verify\s*&\s*Continue/i });
    this.continueButton = page.getByRole('button', { name: /^Continue$/i });
    this.backButton = page.getByRole('button', { name: /back/i });

    // Validation errors
    this.companyNameError = page.getByText(/company name.*required/i);
    this.licenseNumberError = page.getByText(/licen[cs]e.*required/i);

    // Loading indicator
    this.loadingIndicator = page.getByText(/Finding the best quotes/i);
  }

  async open() {
    await this.navigateTo('/quote/company-details');
  }

  async waitForPageReady(timeout = 20000) {
    const isLoading = await this.loadingIndicator.isVisible().catch(() => false);
    if (isLoading) {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
    }
  }

  async clickManualEntry() {
    await this.manualEntryCard.click();
    await this.verifyButton.waitFor({ state: 'visible', timeout: 10000 });
  }



  async fillCompanyName(name) {
    const field = this.page
      .locator('input:not([type="hidden"])')
      .filter({ hasNot: this.page.locator('[placeholder*="DD/MM/YYYY"]') })
      .first();
    await field.fill(name);
  }

  async fillLicenseNumber(number) {
    const field = this.page
      .locator('input:not([type="hidden"])')
      .filter({ hasNot: this.page.locator('[placeholder*="DD/MM/YYYY"]') })
      .nth(1);
    await field.fill(number);
  }

  async fillExpiryDate(date) {
    await this.expiryDateInput.fill(date);
  }

  async clickVerify() {
    await this.verifyButton.click();
    await this.page.waitForTimeout(2000);
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillAndVerify(details) {
    await this.fillCompanyName(details.companyName);
    await this.fillLicenseNumber(details.licenseNumber);
    if (details.expiryDate) await this.fillExpiryDate(details.expiryDate);
    await this.clickVerify();
  }
}

module.exports = CompanyDetailsPage;
