const formats = require('../formats');

const isHealth = require('./isHealth');

module.exports = ({ ctx, health }) => {
  const status = ctx.status;
  const duration = new Date().getTime() - ctx.startedAt;

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: formats.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG,
      status,
      duration
    });
  }

  return Object.assign({ status, duration }, ctx.logCtx, { log_tag: formats.CATEGORY.OUTBOUND_RESPONSE.TAG });
};
