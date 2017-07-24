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

const defaultAdapter = {
    onInboundRequest: function ({ ctx }) {
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
                    this.logger.info(`${MSG.INBOUND_REQUEST} ${ctx.logCtx.method} ${ctx.logCtx.path}`);
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
        this.logger.info(msg);
    },
    onOutboundResponse: function ({ ctx }) {
        const status = ctx.status;
        const duration = new Date().getTime() - ctx.startedAt;

        const health = this.health;
        const method = ctx.logCtx.method;
        if (health) { // todo refactor: this is also used in the onInboundRequest function
            for (let i = 0; i < health.length; i++) {
                const h = health[i];
                if (ctx.request.path === h.path && method === h.method.toUpperCase()) {
                    this.logger.info(`${MSG.OUTBOUND_RESPONSE} ${ctx.logCtx.method} ${ctx.logCtx.path} ${status} ${duration}ms`);
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
        this.logger.info(msg);
    },
    onError({ ctx, err }) {
        err.action = `${ctx.logCtx.method}${ctx.request.path}`;
        err.params = {
            query: ctx.request.query,
            body: ctx.request.body,
            log_tag: this.constructor.EVENT.UNEXPECTED_ERROR
        };
        err.context = Object.assign(err.context || {}, ctx.logCtx);

        this.logger.error(err);
    },
    requestProxy: (options) => {
        const { logger, serialize, outboundRequestId } = options;
        const requestHandler = {
            apply: (target, thisArg, argumentsList) => {
                const incomingMessage = argumentsList[0];
                const method = incomingMessage.method;
                const port = incomingMessage.port;

                const requestId = outboundRequestId ?
                    incomingMessage.headers[outboundRequestId] :
                    undefined;

                const requestIdMsg = requestId ?
                    `[${requestId}] ` :
                    '';

                let protocol = incomingMessage.url ?
                    incomingMessage.url.protocol :
                    incomingMessage.protocol;

                protocol = protocol.substring(0, protocol.length - 1);

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

                const logCtx = serialize({ method, protocol, host, port,
                    path, query, requestId, log_tag: TAG.OUTBOUND_REQUEST });

                setImmediate(logger.info.bind(logger),
                    `${requestIdMsg}${MSG.OUTBOUND_REQUEST} ${method} ${path} | ${logCtx}`);

                const startedAt = new Date().getTime();
                const req = target.apply(thisArg, argumentsList);
                req.on('response', function () {
                    const duration = new Date().getTime() - startedAt;
                    const incomingMessage = arguments[0];
                    const status = incomingMessage.statusCode;
                    const logCtx = serialize({ status, duration, requestId, log_tag: TAG.INBOUND_RESPONSE });
                    setImmediate(logger.info.bind(logger),
                        `${requestIdMsg}${MSG.INBOUND_RESPONSE} ${method} ${path} ${status} ${duration}ms | ${logCtx}`);
                });

                return req;
            }
        };
        return requestHandler;
    }
};

module.exports = () => {
    return defaultAdapter;
};

