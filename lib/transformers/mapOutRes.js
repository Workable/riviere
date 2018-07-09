const logTags = require('../logTags');
const flat = require('flat');

const isHealth = require('./isHealth');

module.exports = ({ ctx, health, headersRegex }) => {
  const status = ctx.status;
  const duration = new Date().getTime() - ctx.riviereStartedAt;

  let headers = {};
  if (headersRegex) {
    Object.keys(ctx.response.headers).forEach(header => {
      if (new RegExp(headersRegex).test(header)) {
        headers[header] = ctx.response.headers[header];
      }
    });

    if (Object.keys(headers).length) {
      headers = flat({ headers });
    }
  }

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG,
      status,
      duration
    });
  }

  return Object.assign({ status, duration, headers }, ctx.logCtx, { log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE.TAG });
};
