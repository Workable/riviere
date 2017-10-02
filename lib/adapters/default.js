const lodash = require('lodash');
const flat = require('flat');
const http = require('http');
const url = require('url');
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

      try {
        const incomingMessage = argumentsList[0];
        reqObj = mapOutReq(incomingMessage, traceHeaderName);
        if (!reqObj.protocol) {
          // do not log custom requests (for example requests started by the newrelic agent)
          return target.apply(thisArg, argumentsList);
        }
        sync ?
          logger[level](reqObj) :
          setImmediate(logger[level].bind(logger), reqObj);
      } catch (err) {
        logger.error(err);
        return target.apply(thisArg, argumentsList);
      }

      const startedAt = new Date().getTime();

      const req = target.apply(thisArg, argumentsList);

      req.on('response', function () {
        try {
          const res = arguments[0];
            const resObj = mapInRes(res, reqObj, startedAt);
          sync ?
            logger[level](resObj) :
            setImmediate(logger[level].bind(logger), resObj);
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
  ctx.logCtx = this.context(ctx);

  const parsedUrl = ctx.request.req._parsedUrl || url.parse(ctx.request.req.url);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  Object.assign(ctx.logCtx, {
    protocol: ctx.request.protocol,
    method: ctx.request.method.toUpperCase(),
    path,
    query
  });

  const { health, bodyKeys, headersRegex } = this;
  const transformedReq = mapInReq({ ctx, health, bodyKeys, headersRegex });

  this.sync ?
    this.logger[this.inbound.level](transformedReq) :
    setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedReq);
}

function onOutboundResponse({ ctx }) {
  const transformedRes = mapOutRes({ ctx, health: this.health });
  this.sync ?
    this.logger[this.inbound.level](transformedRes) :
    setImmediate(this.logger[this.inbound.level].bind(this.logger), transformedRes);

}

function onError({ ctx, err }) {
  const transformedErr = mapError({ ctx, err });
  this.sync ?
    this.logger.error(transformedErr) :
    setImmediate(this.logger.error.bind(this.logger), transformedErr);
}

module.exports = {
  onInboundRequest,
  onOutboundResponse,
  onError,
  requestProxy
};
