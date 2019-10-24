const logTags = require('../logTags');
const flat = require('flat');
const pick = require('lodash/pick');
const url = require('url');

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

  const isProperMethod = method === 'POST' || method === 'PUT' || method === 'PATCH';

  if (isProperMethod && bodyKeys && typeof ctx.request.body === 'object') {
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
    ...pick(req, ['method', 'protocol', 'host', 'path', 'query', 'href']),
    status,
    duration,
    requestId: reqId,
    contentLength,
    userAgent,
    log_tag: logTags.CATEGORY.INBOUND_RESPONSE.TAG
  };
};

const mapOutReq = (requestOptions, reqId, opts = {}) => {
  const method = requestOptions.method;
  const port = requestOptions.port;
  const requestId = reqId;
  const headersRegex = opts.headersRegex;

  const { protocol, host, path, query, href } = getUrlParameters(requestOptions);

  const { maxQueryChars, maxPathChars, maxHrefChars } = opts;

  const slicedQuery = truncateText(query, maxQueryChars);
  const slicedPath = truncateText(path, maxPathChars);
  const slicedHref = truncateText(href, maxHrefChars);

  const metaHeaders = extractHeaders(headersRegex, requestOptions.headers);

  let metaBody = {};

  const hasJsonContentType =
    requestOptions.headers &&
    ((requestOptions.headers['Content-type'] && requestOptions.headers['Content-type'].includes('application/json')) ||
      (requestOptions.headers['content-type'] && requestOptions.headers['content-type'].includes('application/json')) ||
      (requestOptions.headers['Content-Type'] && requestOptions.headers['Content-Type'].includes('application/json')));

  const isProperMethod = method === 'POST' || method === 'PUT' || method === 'PATCH';

  const isValidToExtractBody = isProperMethod && opts.bodyKeys && requestOptions.body && hasJsonContentType;
  if (isValidToExtractBody) {
    try {
      const jsonObject = JSON.parse(requestOptions.body);
      const picked = pick(jsonObject, opts.bodyKeys);
      if (Object.keys(picked).length) {
        metaBody = flat({ body: picked }, { safe: true });
      }
    } catch (e) {}
  }

  let contentLength = getContentLength(requestOptions.headers);

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
  return headers['content-length'] || headers['Content-length'] || headers['Content-Length'] || 0;
};

const getUserAgent = headers => {
  if (!headers) return '';
  return headers['user-agent'] || headers['User-agent'] || headers['User-Agent'] || '';
};

const getUrlParameters = requestOptions => {
  const usedOptions = requestOptions.uri || requestOptions;

  let protocol = usedOptions.protocol;
  protocol = protocol && protocol.substring(0, protocol.length - 1);

  const host = usedOptions.hostname || usedOptions.host;
  const path = usedOptions.path || usedOptions.pathname;
  const query = usedOptions.query;
  const href = url.format(usedOptions);

  return { protocol, host, path, query, href };
};

module.exports = {
  mapError,
  mapInReq,
  mapInRes,
  mapOutReq,
  mapOutRes
};
