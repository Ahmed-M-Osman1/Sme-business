const BasePage = require('./BasePage');

class UploadLicencePage extends BasePage {
  constructor(page) {
    super(page);

    // Step indicator
    this.stepIndicator = page.getByText(/Step 2 of 6/i);

    // Page heading
    this.pageHeading = page.getByRole('heading', { name: /Upload trade licence/i });

    // Upload elements
    this.dropZone = page.getByText(/Drop your trade licence here/i);
    this.browseFilesLink = page.getByText(/browse files/i);
    this.fileInput = page.locator('input[type="file"]');
    this.acceptedFormatsText = page.getByText(/PDF, PNG, or JPG/i);

    // What happens next section
    this.whatHappensNext = page.getByText(/What happens next/i);

    // Alternative path links
    this.tryAiAdvisorLink = page.getByText(/Try AI Advisor/i);
    this.enterManuallyLink = page.getByText(/Enter.*manually/i).first();

    // Navigation
    this.backButton = page.getByText('Back').first();
  }

  async open() {
    await this.navigateTo('/quote/upload');
  }

  async clickTryAiAdvisor() {
    await this.tryAiAdvisorLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickEnterManually() {
    await this.enterManuallyLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyDropZoneVisible() {
    await this.dropZone.waitFor({ state: 'visible' });
  }
}

module.exports = UploadLicencePage;
