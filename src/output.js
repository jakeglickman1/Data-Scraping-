const fs = require('fs/promises');
const path = require('path');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

/**
 * Persist scraped records to either CSV or XLS format and return the filepath.
 */
async function saveResults(records, keyword, fileType = 'csv', directory = process.cwd()) {
  if (!Array.isArray(records) || !records.length) {
    throw new Error('No products to save');
  }

  // Build a deterministic filename so repeated runs are easy to find
  const safeKeyword = sanitizeKeyword(keyword);
  const extension = fileType === 'xls' ? 'xls' : 'csv';
  const filename = `${safeKeyword}_products_${Date.now()}.${extension}`;
  const filePath = path.join(directory, filename);

  if (extension === 'xls') {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(records);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, filePath);
  } else {
    const parser = new Parser(); // json2csv handles CSV quoting/escaping
    const csv = parser.parse(records);
    await fs.writeFile(filePath, csv, 'utf8');
  }

  return filePath;
}

/**
 * Produce filesystem-safe filenames derived from the keyword (amazon_*.csv).
 */
function sanitizeKeyword(keyword = '') {
  const normalized = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const trimmed = normalized.replace(/^_+|_+$/g, '');
  return trimmed || 'amazon';
}

module.exports = {
  saveResults,
};
