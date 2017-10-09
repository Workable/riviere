const formats = require('../formats');

module.exports = (res, req, startedAt, reqId) => {
  const duration = new Date().getTime() - startedAt;
  const status = res.statusCode;
  return {
    method: req.method,
    protocol: req.protocol,
    host: req.host,
    path: req.path,
    status,
    duration,
    requestId: reqId,
    log_tag: formats.CATEGORY.INBOUND_RESPONSE.TAG
  };
};
