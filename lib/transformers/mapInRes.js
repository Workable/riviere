const logTags = require('../logTags');
const { pick } = require('lodash');

module.exports = (res, req, startedAt, reqId) => {
  const duration = new Date().getTime() - startedAt;
  const status = res.statusCode;
  return {
    ...pick(req, ['method', 'protocol', 'host', 'path', 'query']),
    status,
    duration,
    requestId: reqId,
    log_tag: logTags.CATEGORY.INBOUND_RESPONSE.TAG
  };
};
