const constants = require('../constants');

module.exports = (res, req, startedAt) => {
    const duration = new Date().getTime() - startedAt;
    const status = res.statusCode;
    return {
        method: req.method,
        path: req.path,
        status,
        duration,
        requestId: req.requestId,
        log_tag: constants.CATEGORY.INBOUND_RESPONSE.TAG
    };
};
