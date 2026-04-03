const fs = require('fs/promises');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const COVERAGE_DIR = path.join(ROOT_DIR, '.coverage');
const RAW_DIR = path.join(COVERAGE_DIR, 'raw');
const REPORT_DIR = path.join(ROOT_DIR, 'coverage-report');

function isRelevantAsset(url) {
  if (!url) return false;
  if (!url.startsWith('http://localhost:3000/')) return false;
  if (url.includes('react-refresh')) return false;
  if (url.includes('webpack')) return false;
  if (url.includes('polyfills')) return false;
  if (url.includes('_buildManifest')) return false;
  if (url.includes('_ssgManifest')) return false;
  return url.endsWith('.js') || url.endsWith('.css');
}

function mergeRanges(ranges) {
  const sorted = [...ranges]
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end))
    .sort((left, right) => left.start - right.start);

  const merged = [];

  for (const range of sorted) {
    const current = { start: range.start, end: range.end };
    const previous = merged[merged.length - 1];

    if (!previous || current.start > previous.end) {
      merged.push(current);
      continue;
    }

    previous.end = Math.max(previous.end, current.end);
  }

  return merged;
}

function summarizeEntry(entry) {
  const text = entry.text || '';
  const totalBytes = text.length;
  const mergedRanges = mergeRanges(entry.ranges || []);
  const usedBytes = mergedRanges.reduce(
    (total, range) => total + Math.max(0, range.end - range.start),
    0,
  );
  const pct = totalBytes === 0 ? 100 : Number(((usedBytes / totalBytes) * 100).toFixed(2));

  return {
    url: entry.url,
    type: entry.type,
    totalBytes,
    usedBytes,
    pct,
  };
}

function renderHtml(summary) {
  const rows = summary.files
    .map((file) => {
      const status = file.pct === 100 ? 'full' : file.pct >= 80 ? 'good' : 'low';
      return `
        <tr class="${status}">
          <td><code>${file.url}</code></td>
          <td>${file.type.toUpperCase()}</td>
          <td>${file.usedBytes.toLocaleString()}</td>
          <td>${file.totalBytes.toLocaleString()}</td>
          <td><strong>${file.pct}%</strong></td>
        </tr>
      `;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Shory E2E Coverage</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 32px; color: #111827; }
      h1 { margin-bottom: 8px; }
      .meta { color: #4b5563; margin-bottom: 24px; }
      .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
      .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 20px; min-width: 180px; }
      .card strong { display: block; font-size: 28px; margin-top: 6px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; vertical-align: top; }
      th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
      code { white-space: pre-wrap; word-break: break-word; }
      tr.full strong { color: #047857; }
      tr.good strong { color: #b45309; }
      tr.low strong { color: #b91c1c; }
    </style>
  </head>
  <body>
    <h1>Shory E2E Coverage</h1>
    <p class="meta">This report shows captured client-side asset coverage from the Playwright run. It is byte coverage for loaded assets, not Istanbul line/branch coverage for the entire monorepo.</p>
    <div class="summary">
      <div class="card">
        Assets
        <strong>${summary.fileCount}</strong>
      </div>
      <div class="card">
        Used Bytes
        <strong>${summary.usedBytes.toLocaleString()}</strong>
      </div>
      <div class="card">
        Total Bytes
        <strong>${summary.totalBytes.toLocaleString()}</strong>
      </div>
      <div class="card">
        Overall
        <strong>${summary.pct}%</strong>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Type</th>
          <th>Used</th>
          <th>Total</th>
          <th>Coverage</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

async function clean() {
  await fs.rm(COVERAGE_DIR, { recursive: true, force: true });
  await fs.rm(REPORT_DIR, { recursive: true, force: true });
  console.log('Cleaned E2E coverage artifacts.');
}

async function readRawEntries() {
  const files = await fs.readdir(RAW_DIR).catch(() => []);
  const rawEntries = [];

  for (const file of files) {
    const json = await fs.readFile(path.join(RAW_DIR, file), 'utf8');
    const parsed = JSON.parse(json);

    for (const entry of parsed.js || []) {
      rawEntries.push({ ...entry, type: 'js' });
    }

    for (const entry of parsed.css || []) {
      rawEntries.push({ ...entry, type: 'css' });
    }
  }

  return rawEntries.filter((entry) => isRelevantAsset(entry.url));
}

async function main() {
  if (process.argv.includes('--clean')) {
    await clean();
    return;
  }

  const rawEntries = await readRawEntries();

  if (rawEntries.length === 0) {
    console.error('No coverage artifacts were found. Run with SHORY_E2E_COVERAGE=1 first.');
    process.exit(1);
  }

  const byUrl = new Map();

  for (const entry of rawEntries) {
    const key = `${entry.type}:${entry.url}`;
    const current = byUrl.get(key);

    if (!current) {
      byUrl.set(key, {
        ...entry,
        ranges: [...(entry.ranges || [])],
      });
      continue;
    }

    current.ranges.push(...(entry.ranges || []));
  }

  const files = [...byUrl.values()]
    .map(summarizeEntry)
    .sort((left, right) => right.totalBytes - left.totalBytes);

  const usedBytes = files.reduce((total, file) => total + file.usedBytes, 0);
  const totalBytes = files.reduce((total, file) => total + file.totalBytes, 0);
  const pct = totalBytes === 0 ? 100 : Number(((usedBytes / totalBytes) * 100).toFixed(2));
  const summary = {
    fileCount: files.length,
    usedBytes,
    totalBytes,
    pct,
    files,
  };

  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(REPORT_DIR, 'coverage-summary.json'),
    JSON.stringify(summary, null, 2),
  );
  await fs.writeFile(path.join(REPORT_DIR, 'index.html'), renderHtml(summary));

  console.log(`Coverage report written to ${path.join(REPORT_DIR, 'index.html')}`);
  console.log(`Overall captured asset coverage: ${summary.pct}%`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
