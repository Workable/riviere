const logTags = require('../logTags');
const { extractHeaders, truncateText } = require('../utils');

module.exports = (incomingMessage, reqId, opts = {}) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = reqId;
  const headersRegex = opts.headersRegex;

  let protocol, host, path, query;

  const { maxQueryChars, maxPathChars, maxHrefChars } = opts;

  if (incomingMessage.url) {
    protocol = incomingMessage.url.protocol;
    host = incomingMessage.url.host;
    path = incomingMessage.url.pathname;
    query = incomingMessage.url.query;
  } else {
    protocol = incomingMessage.protocol;
    host = incomingMessage.hostname;
    path = incomingMessage.path;
    query = incomingMessage.query;
  }

  const shouldGetFromUri = !protocol && incomingMessage.uri;

  if (shouldGetFromUri) {
    protocol = incomingMessage.uri.protocol;
    host = incomingMessage.uri.hostname;
    path = incomingMessage.uri.path;
    query = incomingMessage.uri.query;
  }

  protocol = protocol && protocol.substring(0, protocol.length - 1);

  const slicedQuery = truncateText(query, maxQueryChars);
  const slicedPath = truncateText(path, maxPathChars);
  const slicedHref = truncateText(incomingMessage.href, maxHrefChars);

  const metaHeaders = extractHeaders(headersRegex, incomingMessage.headers);

  return {
    ...metaHeaders,
    method,
    protocol,
    host,
    port,
    path: slicedPath,
    query: slicedQuery,
    href: slicedHref,
    requestId,
    log_tag: logTags.CATEGORY.OUTBOUND_REQUEST.TAG
  };
};
