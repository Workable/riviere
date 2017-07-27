const lodash = require('lodash');
const flat = require('flat');
const http = require('http');
const constants = require('../constants');
const transformOutboundRes = require('../transformers/transformOutboundRes');
const transformInboundReq = require('../transformers/transformInboundReq');
const transformOutboundReq = require('../transformers/transformOutboundReq');
const transformInboundRes = require('../transformers/transformInboundRes');
const transformError = require('../transformers/transformError');

function requestProxy(options) {
    const { logger, outboundRequestId } = options;
    const requestHandler = {
        apply: (target, thisArg, argumentsList) => {
            let reqObj;
            try {
                const incomingMessage = argumentsList[0];
                reqObj = transformOutboundReq(incomingMessage, outboundRequestId);
                if (!reqObj.protocol) {
                    // do not log custom requests (for example requests started by the newrelic agent)
                    return target.apply(thisArg, argumentsList);
                }
                setImmediate(logger.info.bind(logger), reqObj);
            } catch (err) {
                setImmediate(logger.error.bind(logger), err);
                return target.apply(thisArg, argumentsList);
            }

            const startedAt = new Date().getTime();

            const req = target.apply(thisArg, argumentsList);

            req.on('response', function () {
                try {
                    const res = arguments[0];
                    const resObj = transformInboundRes(res, reqObj, startedAt);
                    setImmediate(logger.info.bind(logger), resObj);
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
        port: ctx.port
    });

    const { health, bodyKeys, headersRegex } = this;
    const transformedReq = transformInboundReq({ ctx, health, bodyKeys, headersRegex});

    setImmediate(this.logger.info.bind(this.logger), transformedReq);
}

function onOutboundResponse({ ctx }) {
    const transformedRes = transformOutboundRes.call(this, { ctx, health: this.health });
    setImmediate(this.logger.info.bind(this.logger),transformedRes);
}

function onError({ ctx, err }) {
    const transformedErr = transformError({ ctx, err });
    setImmediate(this.logger.error.bind(this.logger), transformedErr);
}

module.exports = () => {
    return {
        onInboundRequest,
        onOutboundResponse,
        onError,
        requestProxy
    };
};
