const constants = require('../constants');

function isHealthEndpoint(ctx, healthConfig) {
    if (healthConfig) {
        const method = ctx.request.method;
        for (let i = 0; i < healthConfig.length; i++) {
            const h = healthConfig[i];
            if (ctx.request.path === h.path && method === h.method.toUpperCase()) return true;
        }
    }
    return false;
} // todo refactor

module.exports = ({ ctx }) => {
    const status = ctx.status;
    const duration = new Date().getTime() - ctx.startedAt;

    const healthConfig = this.health;
    if (isHealthEndpoint(ctx, healthConfig)) {
        return setImmediate(this.logger.info.bind(this.logger), Object.assign({}, ctx.logCtx,
            { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG, status, duration}));
    }

    return Object.assign({ status, duration }, ctx.logCtx, { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE.TAG });
};
