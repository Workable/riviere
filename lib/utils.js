const flat = require('flat');

function safeExec(fn, logger) {
  try {
    return fn();
  } catch (err) {
    logger.error(err);
  }
}

function extractHeaders(headersRegex, headers, prefix = '') {
  let metaHeaders = {};

  if (!headersRegex) {
    return metaHeaders;
  }

  Object.keys(headers).forEach(header => {
    if (new RegExp(headersRegex).test(header)) {
      metaHeaders[header] = headers[header];
    }
  });

  if (Object.keys(metaHeaders).length) {
    metaHeaders = flat({ [`${prefix + (prefix && '.')}headers`]: metaHeaders });
  }

  return metaHeaders;
}

function truncateText(str, maxLength, ending = '...') {
  if (!str || !maxLength || maxLength >= str.length) {
    return str;
  }

  return str.slice(0, maxLength) + ending;
}

module.exports = {
  safeExec,
  extractHeaders,
  truncateText
};
