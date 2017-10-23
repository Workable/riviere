const logTags = require('../logTags');

const isHealth = require('./isHealth');

module.exports = ({ ctx, health }) => {
  const status = ctx.status;
  const duration = new Date().getTime() - ctx.riviereStartedAt;

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG,
      status,
      duration
    });
  }

  return Object.assign({ status, duration }, ctx.logCtx, { log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE.TAG });
};
