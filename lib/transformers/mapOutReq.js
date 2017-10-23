const logTags = require('../logTags');

module.exports = (incomingMessage, reqId) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = reqId;

  let protocol, host, path, query;

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

  return { method, protocol, host, port, path, query, href, requestId, log_tag: logTags.CATEGORY.OUTBOUND_REQUEST.TAG };
};
