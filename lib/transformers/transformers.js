const logTags = require('../logTags');
const pick = require('lodash/pick');
const pickBy = require('lodash/pickBy');
const mapValues = require('lodash/mapValues');
const isObject = require('lodash/isObject');
const url = require('url');

const isHealth = require('./isHealth');
const { extractHeaders, truncateText } = require('../utils');

const mapValuesDeep = (v, callback) => {
  if (v && Array.isArray(v)) {
    return v.map(vv => mapValuesDeep(vv, callback));
  } else if (isObject(v)) {
    return mapValues(v, vv => mapValuesDeep(vv, callback));
  } else {
    return callback(v);
  }
};

const truncateTextWithLength = length => v =>
  (typeof v === 'string' && truncateText(v, length, '[Trimmed by riviere]')) || v;

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

/**
 * Server HTTP in and out responses
 */
const mapInReq = ({ ctx, health, bodyKeys, bodyKeysRegex, bodyKeysCallback, headersRegex, maxBodyValueChars }) => {
  if (isHealth(ctx, health)) {
    return Object.assign({}, ctx.logCtx, {
      log_tag: logTags.CATEGORY.INBOUND_REQUEST_HEALTH.TAG
    });
  }
  const meta = extractRequestMeta(ctx, bodyKeys, bodyKeysRegex, bodyKeysCallback, maxBodyValueChars, headersRegex);

  let userAgent = getUserAgent(ctx.headers);

  return Object.assign({}, ctx.logCtx, meta, {
    log_tag: logTags.CATEGORY.INBOUND_REQUEST.TAG,
    userAgent
  });
};

const mapOutRes = ({ ctx, health, bodyKeys, bodyKeysRegex, bodyKeysCallback, headersRegex, maxBodyValueChars }) => {
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

  const meta = extractRequestMeta(
    ctx,
    bodyKeys,
    bodyKeysRegex,
    bodyKeysCallback,
    maxBodyValueChars,
    headersRegex,
    'request'
  );

  let contentLength = ctx.state.calculatedContentLength || 0;
  let userAgent = getUserAgent(ctx.headers);

  return Object.assign({ status, duration, headers }, ctx.logCtx, meta, {
    log_tag: logTags.CATEGORY.OUTBOUND_RESPONSE.TAG,
    contentLength,
    userAgent
  });
};

/**
 * Api call logs
 */
const mapInRes = (res, req, startedAt, reqId, opts) => {
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
    log_tag: logTags.CATEGORY.INBOUND_RESPONSE.TAG,
    metaHeaders: { request: req.metaHeaders }
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
  const hasBodyKeysSelector =
    opts.bodyKeys || opts.bodyKeysRegex || (opts.bodyKeysCallback && typeof opts.bodyKeysCallback === 'function');

  const isValidToExtractBody = isProperMethod && requestOptions.body && hasJsonContentType && hasBodyKeysSelector;
  if (isValidToExtractBody) {
    try {
      const jsonObject = JSON.parse(requestOptions.body);
      let picked = opts.maxBodyValueChars
        ? mapValuesDeep(jsonObject, truncateTextWithLength(opts.maxBodyValueChars))
        : jsonObject;
      if (opts.bodyKeysCallback && typeof opts.bodyKeysCallback === 'function') {
        picked = opts.bodyKeysCallback(picked);
      } else if (opts.bodyKeysRegex) {
        const REGEX = opts.bodyKeysRegex;
        picked = pickBy(picked, (_, key) => REGEX.test(key));
      } else {
        picked = pick(picked, opts.bodyKeys);
      }
      if (Object.keys(picked).length) {
        metaBody = { body: picked };
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

function extractRequestMeta(
  ctx,
  bodyKeys,
  bodyKeysRegex,
  bodyKeysCallback,
  maxBodyValueChars,
  headersRegex,
  prefix = ''
) {
  const method = ctx.request.method;

  // pick headers
  const metaHeaders = extractHeaders(headersRegex, ctx.request.headers, prefix);

  // pick body
  let metaBody;

  const isProperMethod = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const hasBodyKeysSelector = bodyKeys || bodyKeysRegex || (bodyKeysCallback && typeof bodyKeysCallback === 'function');

  if (isProperMethod && hasBodyKeysSelector && typeof ctx.request.body === 'object') {
    let picked = maxBodyValueChars
      ? mapValuesDeep(ctx.request.body, truncateTextWithLength(maxBodyValueChars))
      : ctx.request.body;
    if (bodyKeysCallback && typeof bodyKeysCallback === 'function') {
      picked = bodyKeysCallback(picked, ctx);
    } else if (bodyKeysRegex) {
      const REGEX = bodyKeysRegex;
      picked = pickBy(picked, (_, key) => REGEX.test(key));
    } else {
      picked = pick(picked, bodyKeys);
    }
    if (Object.keys(picked).length) {
      if (prefix) {
        metaBody = { [prefix]: { body: picked } };
      } else {
        metaBody = { body: picked };
      }
    }
  }

  const meta = {};

  if (metaHeaders && Object.keys(metaHeaders).length) {
    meta.metaHeaders = metaHeaders;
  }
  if (metaBody) {
    meta.metaBody = metaBody;
  }

  return meta;
}

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
