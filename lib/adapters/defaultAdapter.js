const lodash = require('lodash');
const flat = require('flat');

const http = require('http');

const TAG =  {
    OUTBOUND_REQUEST: 'outbound_request',
    INBOUND_RESPONSE: 'inbound_response'
};

const MSG = {
    INBOUND_REQUEST: '<--',
    OUTBOUND_RESPONSE: '-->',
    OUTBOUND_REQUEST: '->',
    INBOUND_RESPONSE: '<-'
};

function outboundRequestToJson(incomingMessage, outboundRequestId) {
    const method = incomingMessage.method;
    const port = incomingMessage.port;
    const requestId = outboundRequestId && incomingMessage.headers?
        incomingMessage.headers[outboundRequestId] :
        undefined;
    let protocol = incomingMessage.url ?
        incomingMessage.url.protocol :
        incomingMessage.protocol;

    protocol = protocol ?
        protocol.substring(0, protocol.length - 1) :
        undefined;

    let host, path, query;

    path = incomingMessage.url ?
        incomingMessage.url.pathname :
        incomingMessage.path;

    if (incomingMessage.url) {
        query = incomingMessage.url.query;
        host = incomingMessage.url.host;
    } else {
        host = incomingMessage.hostname;
        query = incomingMessage.query;
    }
    return { method, protocol, host, port, path, query, requestId, log_tag: TAG.OUTBOUND_REQUEST };
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
        log_tag: TAG.INBOUND_RESPONSE
    };
}

function requestProxy(options) {
    const { logger, serialize, outboundRequestId } = options;
    const requestHandler = {
        apply: (target, thisArg, argumentsList) => {
            const incomingMessage = argumentsList[0];

            const reqObj = outboundRequestToJson(incomingMessage, outboundRequestId);

            const requestIdMsg = reqObj.requestId ?
                `[${reqObj.requestId}] ` :
                '';

            setImmediate(logger.info.bind(logger),
                `${requestIdMsg}${MSG.OUTBOUND_REQUEST} ${reqObj.method} ${reqObj.path} | ${serialize(reqObj)}`);

            const startedAt = new Date().getTime();

            const req = target.apply(thisArg, argumentsList);

            req.on('response', function () {
                const resObj = inboundResponseToJson(arguments[0], reqObj, startedAt);
                setImmediate(logger.info.bind(logger),
                    `${requestIdMsg}${MSG.INBOUND_RESPONSE} ${resObj.method} ${resObj.path} ` +
                    `${resObj.status} ${resObj.duration}ms | ${serialize(resObj)}`);
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

    const health = this.health;
    if (health) {
        for (let i = 0; i < health.length; i++) {
            const h = health[i];
            if (ctx.request.path === h.path && method === h.method.toUpperCase()) {
                const msg = `${MSG.INBOUND_REQUEST} ${ctx.logCtx.method} ${ctx.logCtx.path}`;
                setImmediate(this.logger.info.bind(this.logger), msg);
                return;
            }
        }
    }

    let metaBody;
    if (method === 'POST' && this.bodyKeys) {
        const picked = lodash.pick(ctx.request.body, this.bodyKeys);
        if (Object.keys(picked).length) {
            metaBody = flat({body: picked}, {safe: true});
        }
    }

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
            log_tag: this.constructor.EVENT.INBOUND_REQUEST
        }
    );

    const msg = `[${data.requestId}] ${MSG.INBOUND_REQUEST} ${data.method} ${data.path} | ${this.serialize(data)}`;
    setImmediate(this.logger.info.bind(this.logger), msg);
}

function onOutboundResponse({ ctx }) {
    const status = ctx.status;
    const duration = new Date().getTime() - ctx.startedAt;

    const health = this.health;
    const method = ctx.logCtx.method;
    if (health) { // todo refactor: this is also used in the onInboundRequest function
        for (let i = 0; i < health.length; i++) {
            const h = health[i];
            if (ctx.request.path === h.path && method === h.method.toUpperCase()) {
                const msg = `${MSG.OUTBOUND_RESPONSE} ${ctx.logCtx.method} ${ctx.logCtx.path} ${status} ${duration}ms`;
                setImmediate(this.logger.info.bind(this.logger), msg);
                return;
            }
        }
    }

    const data = Object.assign(
        {
            status,
            duration
        },
        ctx.logCtx,
        {
            log_tag: this.constructor.EVENT.OUTBOUND_RESPONSE
        }
    );
    const msg = `[${data.requestId}] ${MSG.OUTBOUND_RESPONSE} ${ctx.logCtx.method} ${ctx.logCtx.path} ${data.status} ${data.duration}ms | ${this.serialize(data)}`;
    setImmediate(this.logger.info.bind(this.logger), msg);
}

function onError({ ctx, err }) {
    err.action = `${ctx.logCtx.method}${ctx.request.path}`;
    err.params = {
        query: ctx.request.query,
        body: ctx.request.body,
        log_tag: this.constructor.EVENT.UNEXPECTED_ERROR
    };
    err.context = Object.assign(err.context || {}, ctx.logCtx);

    this.logger.error(err);
}

module.exports = () => {
    return {
        onInboundRequest,
        onOutboundResponse,
        onError,
        requestProxy
    };
};
