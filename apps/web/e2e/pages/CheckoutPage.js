const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 6 of 6/i);

    // Page heading
    this.pageHeading = page.getByRole('heading').first();

    // Order summary
    this.orderSummary = page.getByText(/Order summary/i);
    this.totalPremium = page.getByText(/Total premium/i);

    // Contact form fields
    this.fullNameInput = page.getByPlaceholder(/name/i).first();
    this.emailInput = page.getByPlaceholder(/email/i).first();
    this.phoneInput = page.getByPlaceholder(/phone|mobile/i).first();

    // Validation errors
    this.nameError = page.getByText(/name.*required/i);
    this.emailError = page.getByText(/invalid email/i);
    this.phoneError = page.getByText(/invalid phone/i);

    // Pay button
    this.payButton = page.getByRole('button', { name: /Pay/i });

    // Processing state
    this.processingIndicator = page.getByText(/processing/i);
  }

  async open() {
    await this.navigateTo('/quote/checkout');
  }

  async fillFullName(name) {
    await this.fullNameInput.fill(name);
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPhone(phone) {
    await this.phoneInput.fill(phone);
  }

  async fillContactDetails(details) {
    await this.fillFullName(details.fullName);
    await this.fillEmail(details.email);
    await this.fillPhone(details.phone);
  }

  async clickPay() {
    await this.payButton.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyOrderSummaryVisible() {
    await this.orderSummary.waitFor({ state: 'visible' });
  }

  async verifyContactFormVisible() {
    await this.fullNameInput.waitFor({ state: 'visible' });
    await this.emailInput.waitFor({ state: 'visible' });
    await this.phoneInput.waitFor({ state: 'visible' });
  }
}

module.exports = CheckoutPage;
