const flat = require('flat');

function safeExec(fn, logger) {
  try {
    return fn();
  } catch (err) {
    logger.error(err);
  }
}

function extractHeaders(headersRegex, headers) {
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
    metaHeaders = flat({ headers: metaHeaders });
  }

  return metaHeaders;
}

module.exports = {
  safeExec,
  extractHeaders
};
