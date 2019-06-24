const url = require('url');
const uuidv4 = require('uuid/v4');

const transformersPath = '../transformers';
const mapOutRes = require(`${transformersPath}/mapOutRes`);
const mapInReq = require(`${transformersPath}/mapInReq`);
const mapOutReq = require(`${transformersPath}/mapOutReq`);
const mapInRes = require(`${transformersPath}/mapInRes`);
const mapError = require(`${transformersPath}/mapError`);

const context = (ctx, traceHeaderName) => {
  return {
    requestId: ctx.req.headers[traceHeaderName]
  };
};

function requestProxy({ logger, level, traceHeaderName, opts = {} } = {}) {
  traceHeaderName = traceHeaderName && traceHeaderName.toLowerCase();

  const requestHandler = {
    apply: (target, thisArg, argumentsList) => {
      let reqObj;
      let reqId;

      try {
        const incomingMessage = argumentsList[0];

        reqId =
          incomingMessage.headers && incomingMessage.headers[traceHeaderName]
            ? incomingMessage.headers[traceHeaderName]
            : uuidv4();

        reqObj = mapOutReq(incomingMessage, reqId, opts);
        if (!reqObj.protocol) {
          // do not log custom requests (for example requests started by the newrelic agent)
          return target.apply(thisArg, argumentsList);
        }
        logger[level](reqObj);
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
          logger[level](resObj);
        } catch (err) {
          logger.error(err);
        }
      });

      return req;
    }
  };

  return requestHandler;
}

function onInboundRequest({ ctx }) {
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

  const { health, bodyKeys, headersRegex } = this;
  const transformedReq = mapInReq({ ctx, health, bodyKeys, headersRegex });

  this.logger[this.inbound.level](transformedReq);
}

function onOutboundResponse({ ctx }) {
  const transformedRes = mapOutRes(Object.assign({}, this, { ctx }));
  this.logger[this.inbound.level](transformedRes);
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
