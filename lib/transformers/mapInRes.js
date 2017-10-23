const logTags = require('../logTags');

module.exports = (res, req, startedAt, reqId) => {
  const duration = new Date().getTime() - startedAt;
  const status = res.statusCode;
  return {
    method: req.method,
    protocol: req.protocol,
    host: req.host,
    path: req.path,
    query: req.query,
    status,
    duration,
    requestId: reqId,
    log_tag: logTags.CATEGORY.INBOUND_RESPONSE.TAG
  };
};
