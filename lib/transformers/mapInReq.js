const flat = require('flat');
const pick = require('lodash/pick');

const isHealth = require('./isHealth');
const constants = require('../constants');

module.exports = ({ ctx, health, bodyKeys, headersRegex }) => {
  const method = ctx.request.method;

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, { log_tag: constants.CATEGORY.INBOUND_REQUEST_HEALTH.TAG });
  }

  // pick headers
  let metaHeaders = {};

  if (headersRegex) {
    Object.keys(ctx.request.headers).forEach(header => {
      if (new RegExp(headersRegex).test(header)) {
        metaHeaders[header] = ctx.request.headers[header];
      }
    });

    if (Object.keys(metaHeaders).length) {
      metaHeaders = flat({ headers: metaHeaders });
    }
  }

  // pick body
  let metaBody;

  if (method === 'POST' && bodyKeys && typeof ctx.request.body === 'object') {
    const picked = pick(ctx.request.body, bodyKeys);
    if (Object.keys(picked).length) {
      metaBody = flat({ body: picked }, { safe: true });
    }
  }

  const meta = {};

  if (metaHeaders) {
    meta.metaHeaders = metaHeaders;
  }
  if (metaBody) {
    meta.metaBody = metaBody;
  }

  return Object.assign({}, ctx.logCtx, meta, {
    log_tag: constants.CATEGORY.INBOUND_REQUEST.TAG
  });
};
