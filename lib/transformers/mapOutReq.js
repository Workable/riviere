const logTags = require('../logTags');

module.exports = (incomingMessage, reqId = undefined, opts = {}) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = reqId;

  let protocol, host, path, query;

  const { maxChars } = opts;

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

  const shouldSliceQuery = !!(maxChars && query && query.length > maxChars);
  const shouldSlicePath = !!(maxChars && path && path.length > maxChars);
  const shouldSliceHref = !!(maxChars && href && href.length > maxChars);

  const slicedQuery = shouldSliceQuery ? query.slice(0, maxChars) + '...' : query;
  const slicedPath = shouldSlicePath ? path.slice(0, maxChars) + '...' : path;
  const slicedHref = shouldSliceHref ? href.slice(0, maxChars) + '...' : href;

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
