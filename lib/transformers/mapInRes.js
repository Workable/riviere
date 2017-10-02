const formats = require('../formats');

module.exports = (res, req, startedAt) => {
    const duration = new Date().getTime() - startedAt;
  const status = res.statusCode;
  return {
    method: req.method,
    path: req.path,
    status,
    duration,
    requestId: req.requestId,
    log_tag: formats.CATEGORY.INBOUND_RESPONSE.TAG
  };
};
