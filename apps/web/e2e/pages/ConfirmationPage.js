const BasePage = require('./BasePage');

class ConfirmationPage extends BasePage {
  constructor(page) {
    super(page);

    // Success heading
    this.successHeading = page.getByRole('heading').first();

    // Policy details
    this.policyNumber = page.locator('text=/SHR-/').first();
    this.activeBadge = page.getByText(/\bActive\b/).first();

    // Coverage section
    this.coverageSection = page.getByText(/Coverage/i).first();
    this.totalPremium = page.getByText(/Total premium/i);

    // Payment method confirmation
    this.paymentConfirmation = page.locator('[class*="rounded-xl"][class*="border"]').filter({ hasText: /authorised|activated|collected/i }).first();

    // Download buttons
    this.downloadPdfButton = page.getByRole('button', { name: /Download PDF/i });
    this.downloadInvoiceButton = page.getByRole('button', { name: /Download Invoice/i });

    // Value delivered card
    this.valueDelivered = page.getByText(/Value delivered|القيمة المقدمة/i);
    this.timeSaved = page.getByText(/Days saved|أيام وفرتها/i);

    // WhatsApp share
    this.whatsappShareButton = page.getByRole('link', { name: /Share via WhatsApp|شارك عبر واتساب/i });

    // Feedback rating
    this.feedbackSection = page.getByText(/How was your experience|كيف كانت تجربتك/i);
    this.starButtons = page.locator('button').filter({ hasText: '★' });
    this.submitFeedback = page.getByRole('button', { name: /Submit|إرسال/i });

    // Referral card
    this.referralCard = page.getByText(/Refer a Business Owner|أحِل صاحب عمل/i);
    this.copyReferralButton = page.getByRole('button', { name: /Copy Referral Link|نسخ رابط الإحالة/i });

    // Support section
    this.supportSection = page.getByText(/support/i).first();

    // Dashboard / Start new quote
    this.startNewQuoteLink = page.getByRole('link', { name: /start.*new.*quote/i });
    this.dashboardButton = page.getByRole('link', { name: /dashboard/i });
  }

  async open() {
    await this.navigateTo('/quote/confirmation');
  }

  async isConfirmed() {
    return await this.successHeading.isVisible().catch(() => false);
  }

  async clickStartNewQuote() {
    await this.startNewQuoteLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async rateFeedback(stars) {
    await this.starButtons.nth(stars - 1).click();
  }
}

module.exports = ConfirmationPage;
