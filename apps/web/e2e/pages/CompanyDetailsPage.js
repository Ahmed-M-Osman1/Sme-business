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
    this.manualEntryCard = page.getByText(/Enter manually/i).first();
    this.skipButton = page.getByRole('button', { name: /skip/i });

    // Manual form fields
    this.companyNameInput = page.getByPlaceholder(/company name/i);
    this.licenseNumberInput = page.getByPlaceholder(/licen[cs]e/i);
    this.activityDropdown = page.getByRole('combobox').first();
    this.expiryDateInput = page.getByPlaceholder(/DD\/MM\/YYYY/i);
    this.emirateDropdown = page.getByRole('combobox').last();

    // Buttons
    this.verifyButton = page.getByRole('button', { name: /Verify/i });
    this.continueButton = page.getByRole('button', { name: /Continue/i });
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
    await this.page.waitForTimeout(500);
  }

  async clickSkip() {
    await this.skipButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fillCompanyName(name) {
    await this.companyNameInput.fill(name);
  }

  async fillLicenseNumber(number) {
    await this.licenseNumberInput.fill(number);
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
