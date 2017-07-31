const constants = require('../constants');

module.exports = (incomingMessage, outboundRequestId) => {
    const method = incomingMessage.method;
    const port = incomingMessage.port;
    const requestId = outboundRequestId && incomingMessage.headers ?
        incomingMessage.headers[outboundRequestId] :
        undefined;

    let protocol,
        host,
        path,
        query;

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

    protocol = protocol ?
        protocol.substring(0, protocol.length - 1) :
        undefined;

    return { method, protocol, host, port, path, query, requestId, log_tag: constants.CATEGORY.OUTBOUND_REQUEST.TAG };
};
