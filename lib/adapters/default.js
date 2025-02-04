const url = require('url');
const uuidv4 = require('uuid/v4');

const { mapError, mapInReq, mapInRes, mapOutReq, mapOutRes } = require('../transformers/transformers');
const { intersection } = require('lodash');

const context = (ctx, traceHeaderName) => {
  return {
    requestId: ctx.req.headers[traceHeaderName]
  };
};

function requestProxy(options = {}) {
  let { logger, level, traceHeaderName, opts = {} } = options;
  traceHeaderName = traceHeaderName && traceHeaderName.toLowerCase();

  const requestHandler = {
    apply: (target, thisArg, argumentsList) => {
      let reqObj;
      let reqId;

      try {
        const requestOptions = argumentsList[0];
        requestOptions.headers = requestOptions.headers || {};

        if (!requestOptions.headers[traceHeaderName]) {
          requestOptions.headers[traceHeaderName] = uuidv4();
        }

        reqId = requestOptions.headers[traceHeaderName];

        reqObj = mapOutReq(requestOptions, reqId, opts);
        const blacklistedPathRegex = opts.blacklistedPathRegex;
        if (!reqObj.protocol || (blacklistedPathRegex && blacklistedPathRegex.test(reqObj.path))) {
          // do not log custom requests (for example requests started by the newrelic agent)
          return target.apply(thisArg, argumentsList);
        }
        if (opts.request && opts.request.enabled) {
          const shouldObfuscatePath = !!intersection(
            opts.request.obfuscateHrefIfHeaderExists,
            Object.keys(requestOptions.headers).filter(h => h)
          ).length;
          if (shouldObfuscatePath) {
            reqObj.href = `${new URL(reqObj.href).origin}/***`;
            reqObj.path = '/***';
            requestOptions.pathname = '/***';
          }
          logger[level](reqObj, options);
        }
      } catch (err) {
        logger.error(err);
        return target.apply(thisArg, argumentsList);
      }

      const startedAt = new Date().getTime();

      const req = target.apply(thisArg, argumentsList);

      req.on('response', function() {
        try {
          const res = arguments[0];
          const resObj = mapInRes(res, reqObj, startedAt, reqId, opts);
          logger[level](resObj, options);
        } catch (err) {
          logger.error(err);
        }
      });

      return req;
    }
  };

  return requestHandler;
}

function extractLogCtx(ctx) {
  const traceHeaderName = this.traceHeaderName.toLowerCase();

  if (this.forceIds === true && !ctx.req.headers[traceHeaderName]) {
    ctx.req.headers[traceHeaderName] = uuidv4();
  }

  ctx.logCtx = Object.assign(this.context(ctx), context(ctx, traceHeaderName));

  const parsedUrl = ctx.request.req._parsedUrl || url.parse(ctx.request.req.url);
  const path = (this.inbound.includeHost ? ctx.request.origin : '') + parsedUrl.pathname;
  const query = parsedUrl.query;

  Object.assign(ctx.logCtx, {
    method: ctx.request.method.toUpperCase(),
    protocol: ctx.request.protocol,
    path,
    query
  });
}

function onInboundRequest({ ctx }) {
  extractLogCtx.call(this, ctx);

  const {
    health,
    bodyKeys,
    bodyKeysRegex,
    bodyKeysCallback,
    headersRegex,
    headerValueCallback,
    inbound: { maxBodyValueChars }
  } = this;
  const transformedReq = mapInReq({
    ctx,
    health,
    bodyKeys,
    bodyKeysRegex,
    bodyKeysCallback,
    headersRegex,
    headerValueCallback,
    maxBodyValueChars
  });

  this.logger[this.inbound.level](transformedReq, this);
}

function onOutboundResponse({ ctx }) {
  if (!ctx.logCtx) {
    extractLogCtx.call(this, ctx);
  }

  const {
    health,
    bodyKeys,
    bodyKeysRegex,
    bodyKeysCallback,
    headersRegex,
    headerValueCallback,
    outbound: { maxBodyValueChars }
  } = this;
  const transformedRes = mapOutRes({
    ctx,
    health,
    bodyKeys,
    bodyKeysRegex,
    bodyKeysCallback,
    headersRegex,
    headerValueCallback,
    maxBodyValueChars
  });
  this.logger[this.inbound.level](transformedRes, this);
}

function onError({ ctx, err }) {
  const transformedErr = mapError({ ctx, err });
  this.logger.error(transformedErr);
}

module.exports = {
  onInboundRequest,
  onOutboundResponse,
  onError,
  requestProxy
};
