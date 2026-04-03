const fs = require('fs/promises');
const path = require('path');

const COVERAGE_ENABLED = process.env.SHORY_E2E_COVERAGE === '1';
const RAW_DIR = path.join(__dirname, '..', '.coverage', 'raw');

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'coverage';
}

async function startCoverage(page) {
  if (!COVERAGE_ENABLED) {
    return;
  }

  await page.coverage.startJSCoverage({
    resetOnNavigation: false,
    reportAnonymousScripts: true,
  });
  await page.coverage.startCSSCoverage({
    resetOnNavigation: false,
  });
}

async function stopCoverage(page, testInfo) {
  if (!COVERAGE_ENABLED) {
    return;
  }

  const js = await page.coverage.stopJSCoverage().catch(() => []);
  const css = await page.coverage.stopCSSCoverage().catch(() => []);

  await fs.mkdir(RAW_DIR, { recursive: true });

  const fileName = [
    slugify(testInfo.titlePath.join(' ')),
    testInfo.project.name,
    `retry-${testInfo.retry}`,
  ].join('--');

  await fs.writeFile(
    path.join(RAW_DIR, `${fileName}.json`),
    JSON.stringify(
      {
        title: testInfo.title,
        titlePath: testInfo.titlePath,
        project: testInfo.project.name,
        js,
        css,
      },
      null,
      2,
    ),
  );
}

module.exports = {
  startCoverage,
  stopCoverage,
};
