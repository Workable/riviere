const lodash = require('lodash');
const flat = require('flat');
const http = require('http');
const constants = require('../constants');
const mapOutRes = require('../transformers/mapOutRes');
const mapInReq = require('../transformers/mapInReq');
const mapOutReq = require('../transformers/mapOutReq');
const mapInRes = require('../transformers/mapInRes');
const mapError = require('../transformers/mapError');

function requestProxy({ logger, level, outboundRequestId } = {}) {
  const requestHandler = {
    apply: (target, thisArg, argumentsList) => {
      let reqObj;
      try {
        const incomingMessage = argumentsList[0];
        reqObj = mapOutReq(incomingMessage, outboundRequestId);
        if (!reqObj.protocol) {
          // do not log custom requests (for example requests started by the newrelic agent)
          return target.apply(thisArg, argumentsList);
        }
        setImmediate(logger[level].bind(logger), reqObj);
      } catch (err) {
        setImmediate(logger.error.bind(logger), err);
        return target.apply(thisArg, argumentsList);
      }

      const startedAt = new Date().getTime();

      const req = target.apply(thisArg, argumentsList);

      req.on('response', function() {
        try {
          const res = arguments[0];
          const resObj = mapInRes(res, reqObj, startedAt);
          setImmediate(logger[level].bind(logger), resObj);
        } catch (err) {
          setImmediate(logger.error.bind(logger), err);
        }
      });

      return req;
    }
  };
  return requestHandler;
}

function onInboundRequest({ ctx }) {
  ctx.logCtx = this.getLogCtx(ctx);

  Object.assign(ctx.logCtx, {
    protocol: ctx.request.protocol,
    method: ctx.request.method.toUpperCase(),
    path: ctx.originalUrl,
  });

  const { health, bodyKeys, headersRegex } = this;
  const transformedReq = mapInReq({ ctx, health, bodyKeys, headersRegex });

  setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedReq);
}

function onOutboundResponse({ ctx }) {
  const transformedRes = mapOutRes({ ctx, health: this.health });
  setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedRes);
}

function onError({ ctx, err }) {
  const transformedErr = mapError({ ctx, err });
  setImmediate(this.logger.error.bind(this.logger), transformedErr);
}

module.exports = {
  onInboundRequest,
  onOutboundResponse,
  onError,
  requestProxy
};
