const flat = require('flat');
const pick = require('lodash/pick');

const isHealth = require('./isHealth');
const logTags = require('../logTags');
const { extractHeaders } = require('../utils');

module.exports = ({ ctx, health, bodyKeys, headersRegex }) => {
  const method = ctx.request.method;

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: logTags.CATEGORY.INBOUND_REQUEST_HEALTH.TAG
    });
  }

  // pick headers
  const metaHeaders = extractHeaders(headersRegex, ctx.request.headers);

  // pick body
  let metaBody;

  if (method === 'POST' && bodyKeys && typeof ctx.request.body === 'object') {
    const picked = pick(ctx.request.body, bodyKeys);
    if (Object.keys(picked).length) {
      metaBody = flat({ body: picked }, { safe: true });
    }
  }

  const meta = {};

  if (metaHeaders && Object.keys(metaHeaders).length) {
    meta.metaHeaders = metaHeaders;
  }
  if (metaBody) {
    meta.metaBody = metaBody;
  }

  return Object.assign({}, ctx.logCtx, meta, {
    log_tag: logTags.CATEGORY.INBOUND_REQUEST.TAG
  });
};
