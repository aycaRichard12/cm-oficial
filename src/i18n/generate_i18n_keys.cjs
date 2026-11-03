// Generate i18n keys and update language files
// Reads audit_i18n_report.json, creates unique keys, updates src/i18n/en-US/index.js and es-ES/index.js
// and replaces literal strings in source files with $t('key')

const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, 'audit_i18n_report.json');
const enPath = path.join(__dirname, '..', 'en-US', 'index.js');
const esPath = path.join(__dirname, '..', 'es-ES', 'index.js');

function loadAudit() {
  return JSON.parse(fs.readFileSync(auditPath, 'utf8'));
}

// eslint-disable-next-line no-unused-vars
function loadLang(file) {
  const content = fs.readFileSync(file, 'utf8');
  // Simple parse: assume module.exports = { ... } or export default { ... }
  const objMatch = content.match(/export default\s*\{([\s\S]*)\};?$/);
  if (!objMatch) return {};
  // Not a full parser; we will treat as string and append new entries later.
  return {};
}

function insertEntry(content, key, value) {
  // Insert before the last closing brace }
  const insertion = `    ${key}: '${value.replace(/'/g, "\\'")}',\n`;
  const idx = content.lastIndexOf('}');
  return content.slice(0, idx) + insertion + content.slice(idx);
}

function generateKey(entry) {
  const fileBase = entry.file.replace(/^.*[/]src[/]/, '').replace(/[/.-]/g, '_');
  return `${fileBase}_line${entry.line}`;
}

function replaceInFile(file, target, key) {
  const content = fs.readFileSync(file, 'utf8');
  const escaped = target.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(escaped);
  const replacement = `$t('${key}')`;
  const newContent = content.replace(regex, replacement);
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const entries = loadAudit();
  let enContent = fs.readFileSync(enPath, 'utf8');
  let esContent = fs.readFileSync(esPath, 'utf8');
  let modifiedFiles = new Set();
  for (const entry of entries) {
    const key = generateKey(entry);
    // Add to language files if not present (simple check)
    if (!enContent.includes(`${key}:`)) {
      enContent = insertEntry(enContent, key, entry.text);
    }
    if (!esContent.includes(`${key}:`)) {
      // For Spanish, just copy the English text as placeholder
      esContent = insertEntry(esContent, key, entry.text);
    }
    // Replace in source file
    const replaced = replaceInFile(entry.file, entry.text, key);
    if (replaced) modifiedFiles.add(entry.file);
  }
  fs.writeFileSync(enPath, enContent, 'utf8');
  fs.writeFileSync(esPath, esContent, 'utf8');
  console.log(`Updated ${modifiedFiles.size} source files, added ${entries.length} keys.`);
}

if (require.main === module) {
  main();
}
