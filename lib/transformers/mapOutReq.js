const logTags = require('../logTags');

module.exports = (incomingMessage, reqId = undefined, opts = {}) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = reqId;

  let protocol, host, path, query;

  const { maxQueryChars, maxHrefChars } = opts;

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

  const href = incomingMessage.href;

  protocol = protocol ? protocol.substring(0, protocol.length - 1) : undefined;

  const slicedQuery = maxQueryChars ? query && query.slice(0, maxQueryChars) : query;
  const slicedHref = maxHrefChars ? href && href.slice(0, maxHrefChars) : href;
  const slicedPath = maxQueryChars ? path && path.slice(0, maxQueryChars) : path;

  return {
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
