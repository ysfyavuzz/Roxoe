/**
 * Shared utility functions for documentation update scripts
 */

const fs = require('fs');

/**
 * Returns today's date in YYYY-MM-DD format
 * @returns {string} Date string in YYYY-MM-DD format
 */
function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Replaces a line in content that starts with the given prefix
 * @param {string} content - The content to search and replace in
 * @param {string} prefix - The prefix to match at the start of a line
 * @param {string} newLine - The new line to replace with
 * @returns {string} Updated content with the line replaced
 */
function replaceLine(content, prefix, newLine) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(prefix)) {
      lines[i] = newLine;
      return lines.join('\n');
    }
  }
  // If prefix not found, prepend the new line
  return `${newLine}\n${content}`;
}

/**
 * Reads and parses a JSON file
 * @param {string} path - Path to the JSON file
 * @returns {object} Parsed JSON object
 */
function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

module.exports = {
  today,
  replaceLine,
  readJSON
};
