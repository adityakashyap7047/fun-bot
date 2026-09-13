function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeObject(obj, allowedFields) {
  const cleaned = {};
  for (const field of allowedFields) {
    if (obj[field] !== undefined && obj[field] !== null) {
      cleaned[field] = typeof obj[field] === 'string' ? obj[field].trim() : obj[field];
    }
  }
  return cleaned;
}

function containsMongoOperator(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      if (containsMongoOperator(obj[key])) return true;
    }
  }
  return false;
}

module.exports = { escapeHtml, sanitizeObject, containsMongoOperator };
