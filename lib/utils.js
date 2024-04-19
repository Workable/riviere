function safeExec(fn, logger) {
  try {
    return fn();
  } catch (err) {
    logger.error(err);
  }
}

function extractHeaders(headersRegex, headerValueCallback, headers, prefix = '') {
  let metaHeaders = {};

  if (!headersRegex) {
    return metaHeaders;
  }

  const headerValue =
    headerValueCallback && typeof headerValueCallback === 'function' ? headerValueCallback : (key, value) => value;

  Object.keys(headers).forEach(header => {
    if (new RegExp(headersRegex).test(header)) {
      metaHeaders[header] = headerValue(header, headers[header]);
    }
  });

  if (Object.keys(metaHeaders).length) {
    if (prefix) {
      metaHeaders = { [prefix]: { headers: metaHeaders } };
    } else {
      metaHeaders = { headers: metaHeaders };
    }
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
