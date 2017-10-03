const formats = require('../formats');

module.exports = (incomingMessage, traceHeaderName) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = traceHeaderName && incomingMessage.headers ? incomingMessage.headers[traceHeaderName] : undefined;

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

  protocol = protocol ? protocol.substring(0, protocol.length - 1) : undefined;

  return { method, protocol, host, port, path, query, requestId, log_tag: formats.CATEGORY.OUTBOUND_REQUEST.TAG };
};
