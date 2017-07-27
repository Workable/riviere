const constants = require('../constants');

const isHealthEndpoint = require('./isHealthEndpoint');

module.exports = ({ ctx, health }) => {
    const status = ctx.status;
    const duration = new Date().getTime() - ctx.startedAt;

    if (isHealthEndpoint(ctx, health)) {
        return Object.assign({}, ctx.logCtx,
            { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG, status, duration});
    }

    return Object.assign({ status, duration }, ctx.logCtx, { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE.TAG });
};
