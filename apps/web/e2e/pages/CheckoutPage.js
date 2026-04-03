const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 6 of 6/i).first();

    // Page heading
    this.pageHeading = page.getByRole('heading').first();

    // Order summary
    this.orderSummary = page.getByText(/Order summary/i).first();
    this.totalPremium = page.getByText(/Total premium/i).first();
    this.annualPrice = page.getByText(/\/yr/).first();
    this.monthlyPrice = page.getByText(/instalment fee/i).first();

    // Contact form fields
    this.fullNameInput = page.getByPlaceholder(/your full name|name/i).first();
    this.emailInput = page.getByPlaceholder(/you@example\.com|email/i).first();
    this.phoneInput = page.getByPlaceholder(/55 123 4567|phone|mobile/i).first();

    // Validation errors
    this.nameError = page.getByText(/name.*required/i);
    this.emailError = page.getByText(/valid email address/i);
    this.phoneError = page.getByText(/valid UAE mobile number/i);

    // Declaration checkbox
    this.declarationCheckbox = page.locator('input[type="checkbox"]').first();

    // Payment methods
    this.applePayMethod = page.getByRole('button', { name: /Apple Pay/i });
    this.finwallMethod = page.getByRole('button', { name: /Monthly Instalments/i });
    this.cardMethod = page.getByRole('button', { name: /Card Payment/i });
    this.bankMethod = page.getByRole('button', { name: /Bank Transfer/i });

    // Card form fields (visible when card selected)
    this.cardNumberInput = page.getByPlaceholder(/Card number/i);
    this.cardExpiryInput = page.getByPlaceholder(/MM\/YY/i);
    this.cardCvvInput = page.getByPlaceholder(/CVV/i);

    // Card validation errors
    this.cardNumError = page.getByText(/Invalid card number/i);
    this.cardExpError = page.getByText(/Expiry date required/i);
    this.cardCvvError = page.getByText(/CVV required/i);

    // Finwall T&Cs
    this.finwallCheckbox = page.locator('input[type="checkbox"]').last();

    // Security badges
    this.securityBadges = page.getByText(/PCI DSS/i);

    // Pay button
    this.payButton = page.getByRole('button', { name: /Pay|Confirm/i }).last();

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

  async selectPaymentMethod(method) {
    const methodMap = {
      apple_pay: this.applePayMethod,
      finwall: this.finwallMethod,
      card: this.cardMethod,
      bank_transfer: this.bankMethod,
    };
    await methodMap[method].click();
  }

  async fillCardDetails(card) {
    await this.cardNumberInput.pressSequentially(card.number);
    await this.cardExpiryInput.pressSequentially(card.expiry);
    await this.cardCvvInput.pressSequentially(card.cvv);
  }

  async checkDeclaration() {
    await this.declarationCheckbox.check();
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
