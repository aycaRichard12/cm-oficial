// Simple extractor for hard‑coded UI strings (CommonJS)
// Scans .vue, .js, .ts files for literal text in template literals, single‑ and double‑quoted strings.
// Generates src/i18n/audit_i18n_report.json

const fs = require('fs');
const path = require('path');

const exts = ['.vue', '.js', '.ts'];
const ignoredDirs = ['node_modules', 'dist', '.git'];

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (exts.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function extractStrings(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /([`"'])(?:(?!\1).)*[a-zA-ZÀ-ÿ0-9 ,.!?()\\-]+\1/gm; // crude
  const matches = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const raw = m[0];
    if (raw.length > 2) {
      const line = content.slice(0, m.index).split('\n').length;
      matches.push({file: filePath, line, text: raw.slice(1, -1)});
    }
  }
  return matches;
}

function main() {
  const root = path.resolve(__dirname, '..', '..'); // project root
  const files = walk(root);
  const all = [];
  for (const f of files) {
    all.push(...extractStrings(f));
  }
  const outPath = path.join(__dirname, 'audit_i18n_report.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
  console.log(`Extracted ${all.length} candidate strings to ${outPath}`);
}

if (require.main === module) {
  main();
}
