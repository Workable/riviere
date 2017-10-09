const lodash = require('lodash');
const flat = require('flat');
const http = require('http');
const url = require('url');
const uuidv4 = require('uuid/v4');

const formats = require('../formats');
const mapOutRes = require('../transformers/mapOutRes');
const mapInReq = require('../transformers/mapInReq');
const mapOutReq = require('../transformers/mapOutReq');
const mapInRes = require('../transformers/mapInRes');
const mapError = require('../transformers/mapError');

function requestProxy({ logger, level, traceHeaderName, sync = true } = {}) {
  const requestHandler = {
    apply: (target, thisArg, argumentsList) => {
      let reqObj;

      let reqId;

      try {
        const incomingMessage = argumentsList[0];

        reqId = incomingMessage.headers[traceHeaderName] ? incomingMessage.headers[traceHeaderName] : uuidv4();

        reqObj = mapOutReq(incomingMessage, reqId);
        if (!reqObj.protocol) {
          // do not log custom requests (for example requests started by the newrelic agent)
          return target.apply(thisArg, argumentsList);
        }
        sync ? logger[level](reqObj) : setImmediate(logger[level].bind(logger), reqObj);
      } catch (err) {
        logger.error(err);
        return target.apply(thisArg, argumentsList);
      }

      const startedAt = new Date().getTime();

      const req = target.apply(thisArg, argumentsList);

      req.on('response', function() {
        try {
          const res = arguments[0];
          const resObj = mapInRes(res, reqObj, startedAt, reqId);
          sync ? logger[level](resObj) : setImmediate(logger[level].bind(logger), resObj);
        } catch (err) {
          logger.error(err);
        }
      });

      return req;
    }
  };

  return requestHandler;
}

const context = (ctx, traceHeaderName) => {
  return {
    requestId: ctx.req.headers[traceHeaderName]
  };
};

function onInboundRequest({ ctx }) {
  const traceHeaderName = this.traceHeaderName.toLowerCase();
  if (!ctx.req.headers[traceHeaderName]) {
    ctx.req.headers[traceHeaderName] = uuidv4();
  }

  ctx.logCtx = Object.assign(this.context(ctx), context(ctx, traceHeaderName));

  const parsedUrl = ctx.request.req._parsedUrl || url.parse(ctx.request.req.url);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  Object.assign(ctx.logCtx, {
    method: ctx.request.method.toUpperCase(),
    protocol: ctx.request.protocol,
    path,
    query
  });

  const { health, bodyKeys, headersRegex } = this;
  const transformedReq = mapInReq({ ctx, health, bodyKeys, headersRegex });

  this.sync
    ? this.logger[this.inbound.level](transformedReq)
    : setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedReq);
}

function onOutboundResponse({ ctx }) {
  const transformedRes = mapOutRes({ ctx, health: this.health });
  this.sync
    ? this.logger[this.inbound.level](transformedRes)
    : setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedRes);
}

function onError({ ctx, err }) {
  const transformedErr = mapError({ ctx, err });
  this.sync ? this.logger.error(transformedErr) : setImmediate(this.logger.error.bind(this.logger), transformedErr);
}

module.exports = {
  onInboundRequest,
  onOutboundResponse,
  onError,
  requestProxy
};
