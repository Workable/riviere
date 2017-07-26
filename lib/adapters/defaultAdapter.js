const lodash = require('lodash');
const flat = require('flat');
const http = require('http');
const constants = require('../constants');

function outboundRequestToJson(incomingMessage, outboundRequestId) {
    const method = incomingMessage.method;
    const port = incomingMessage.port;
    const requestId = outboundRequestId && incomingMessage.headers ?
        incomingMessage.headers[outboundRequestId] :
        undefined;

    let protocol,
        host,
        path,
        query;

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

    protocol = protocol ?
        protocol.substring(0, protocol.length - 1) :
        undefined;

    return { method, protocol, host, port, path, query, requestId, log_tag: constants.CATEGORY.OUTBOUND_REQUEST.TAG };
}

function inboundResponseToJson(res, req, startedAt) {
    const duration = new Date().getTime() - startedAt;
    const status = res.statusCode;
    return {
        method: req.method,
        path: req.path,
        status,
        duration,
        requestId: req.requestId,
        log_tag: constants.CATEGORY.INBOUND_RESPONSE.TAG
    };
}

function isHealthEndpoint(ctx, healthConfig) {
    if (healthConfig) {
        const method = ctx.request.method;
        for (let i = 0; i < healthConfig.length; i++) {
            const h = healthConfig[i];
            if (ctx.request.path === h.path && method === h.method.toUpperCase()) return true;
        }
    }
    return false;
}

function requestProxy(options) {
    const { logger, serialize, outboundRequestId } = options;
    const requestHandler = {
        apply: (target, thisArg, argumentsList) => {
            let reqObj;
            try {
                const incomingMessage = argumentsList[0];

                reqObj = outboundRequestToJson(incomingMessage, outboundRequestId);

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
                    const resObj = inboundResponseToJson(arguments[0], reqObj, startedAt);
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

    const method = ctx.logCtx.method;

    const healthConfig = this.health;
    if (isHealthEndpoint(ctx, healthConfig)) {
        return setImmediate(this.logger.info.bind(this.logger), Object.assign({}, ctx.logCtx,
            { log_tag: constants.CATEGORY.INBOUND_REQUEST_HEALTH.TAG }));
    }

    // pick body
    let metaBody;
    if (method === 'POST' && this.bodyKeys) {
        const picked = lodash.pick(ctx.request.body, this.bodyKeys);
        if (Object.keys(picked).length) {
            metaBody = flat({body: picked}, {safe: true});
        }
    }

    // pick headers
    let metaHeaders = {};
    if (this.headersRegex) {
        Object.keys(ctx.request.headers).forEach(header => {
            if (this.headersRegex.test(header)) {
                metaHeaders[header] = ctx.request.headers[header];
            }
        });
        if (Object.keys(metaHeaders).length) {
            metaHeaders = flat({headers: metaHeaders});
        }
    }

    // compute the msgObj
    const meta = {};
    if (Object.keys(metaHeaders).length) {
        meta.metaHeaders = metaHeaders;
    }
    if (metaBody) {
        meta.metaBody = metaBody;
    }
    const data = Object.assign(
        {},
        ctx.logCtx,
        meta,
        {
            log_tag: constants.CATEGORY.INBOUND_REQUEST.TAG
        }
    );

    setImmediate(this.logger.info.bind(this.logger), data);
}

function onOutboundResponse({ ctx }) {
    const status = ctx.status;
    const duration = new Date().getTime() - ctx.startedAt;

    const healthConfig = this.health;
    if (isHealthEndpoint(ctx, healthConfig)) {
        return setImmediate(this.logger.info.bind(this.logger), Object.assign({}, ctx.logCtx,
            { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG, status, duration}));
    }

    const msgObj = Object.assign({ status, duration }, ctx.logCtx,
        { log_tag: constants.CATEGORY.OUTBOUND_RESPONSE.TAG });

    setImmediate(this.logger.info.bind(this.logger), msgObj);
}

function onError({ ctx, err }) {
    err.action = `${ctx.logCtx.method}${ctx.request.path}`;
    err.params = {
        query: ctx.request.query,
        body: ctx.request.body,
        log_tag: constants.CATEGORY.UNEXPECTED_ERROR.TAG
    };
    err.context = Object.assign(err.context || {}, ctx.logCtx);

    setImmediate(this.logger.info.bind(this.logger), err);
}

module.exports = () => {
    return {
        onInboundRequest,
        onOutboundResponse,
        onError,
        requestProxy
    };
};
