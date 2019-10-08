const logTags = require('../logTags');
const flat = require('flat');
const pick = require('lodash/pick');

const isHealth = require('./isHealth');
const { extractHeaders, truncateText } = require('../utils');

const mapError = ({ ctx, err }) => {
  err.action = `${ctx.logCtx.method}${ctx.request.path}`;
  err.params = {
    query: ctx.request.query,
    body: ctx.request.body,
    log_tag: logTags.CATEGORY.UNEXPECTED_ERROR.TAG
  };
  err.context = Object.assign(err.context || {}, ctx.logCtx);
  return err;
};

const mapInReq = ({ ctx, health, bodyKeys, headersRegex }) => {
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

  let userAgent = getUserAgent(ctx.headers);

  return Object.assign({}, ctx.logCtx, meta, {
    log_tag: logTags.CATEGORY.INBOUND_REQUEST.TAG,
    userAgent
  });
};

const mapInRes = (res, req, startedAt, reqId) => {
  const duration = new Date().getTime() - startedAt;
  const status = res.statusCode;

  let contentLength = getContentLength(res.headers);
  let userAgent = getUserAgent(res.headers);

  return {
    ...pick(req, ['method', 'protocol', 'host', 'path', 'query']),
    status,
    duration,
    requestId: reqId,
    contentLength,
    userAgent,
    log_tag: logTags.CATEGORY.INBOUND_RESPONSE.TAG
  };
};

const mapOutReq = (incomingMessage, reqId, opts = {}) => {
  const method = incomingMessage.method;
  const port = incomingMessage.port;
  const requestId = reqId;
  const headersRegex = opts.headersRegex;

  let protocol, host, path, query;

  const { maxQueryChars, maxPathChars, maxHrefChars } = opts;

  if (incomingMessage.url) {
    protocol = incomingMessage.url.protocol;
    host = incomingMessage.url.host;
    path = incomingMessage.url.pathname;
    query = incomingMessage.url.query;
  } else {
    protocol = incomingMessage.protocol;
    host = incomingMessage.hostname;
    path = incomingMessage.path;
    query = incomingMessage.query;
  }

  const shouldGetFromUri = !protocol && incomingMessage.uri;

  if (shouldGetFromUri) {
    protocol = incomingMessage.uri.protocol;
    host = incomingMessage.uri.hostname;
    path = incomingMessage.uri.path;
    query = incomingMessage.uri.query;
  }

  protocol = protocol && protocol.substring(0, protocol.length - 1);

  const slicedQuery = truncateText(query, maxQueryChars);
  const slicedPath = truncateText(path, maxPathChars);
  const slicedHref = truncateText(incomingMessage.href, maxHrefChars);

  const metaHeaders = extractHeaders(headersRegex, incomingMessage.headers);

  let metaBody = {};
  const isValidToExtractBody =
    method === 'POST' &&
    opts.bodyKeys &&
    incomingMessage.body &&
    incomingMessage.headers &&
    'Content-type' in incomingMessage.headers &&
    incomingMessage.headers['Content-type'].includes('application/json');
  if (isValidToExtractBody) {
    try {
      const jsonObject = JSON.parse(incomingMessage.body);
      const picked = pick(jsonObject, opts.bodyKeys);
      if (Object.keys(picked).length) {
        metaBody = flat({ body: picked }, { safe: true });
      }
    } catch (e) {}
  }

  let contentLength = getContentLength(incomingMessage.headers);

  return {
    metaHeaders,
    method,
    protocol,
    host,
    port,
    metaBody,
    path: slicedPath,
    query: slicedQuery,
    href: slicedHref,
    requestId,
    contentLength,
    log_tag: logTags.CATEGORY.OUTBOUND_REQUEST.TAG
  };
};

const mapOutRes = ({ ctx, health, bodyKeys, headersRegex }) => {
  const status = ctx.status;
  const duration = new Date().getTime() - ctx.state.riviereStartedAt;

  const headers = extractHeaders(headersRegex, ctx.response.headers);

  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG,
      status,
      duration
    });
  }

  let contentLength = ctx.state.calculatedContentLength || 0;
  let userAgent = getUserAgent(ctx.headers);

  return Object.assign({ status, duration, headers }, ctx.logCtx, {
    log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE.TAG,
    contentLength,
    userAgent
  });
};

const getContentLength = headers => {
  if (!headers) return 0;
  return headers['content-length'] || headers['Content-length'] || 0;
};

const getUserAgent = headers => {
  if (!headers) return '';
  return headers['user-agent'] || headers['User-agent'] || 0;
};

module.exports = {
  mapError,
  mapInReq,
  mapInRes,
  mapOutReq,
  mapOutRes
};
