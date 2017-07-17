const lodash = require('lodash');
const flat = require('flat');

module.exports = () => {
    return {
        onInboundRequest: function({ ctx }) {
            ctx.logCtx = this.getLogCtx(ctx);

            const method = ctx.logCtx.method.toUpperCase();

            let metaBody = {};
            if (method === 'POST' && this.bodyKeys) {
                metaBody = lodash.pick(ctx.request.body, this.bodyKeys);
                metaBody = flat({ body: metaBody }, { safe: true });
            }

            let metaHeaders = {};
            if (this.headersRegex) {
                Object.keys(ctx.request.headers).forEach(header => {
                    if (this.headersRegex.test(header)) {
                        metaHeaders[header] = ctx.request.headers[header];
                    }
                });
                if (Object.keys(metaHeaders).length) {
                    metaHeaders = flat({ headers: metaHeaders });
                }
            }

            const meta = {};
            if (Object.keys(metaHeaders).length) {
                meta.metaHeaders = metaHeaders;
            }
            if (Object.keys(metaBody).length) {
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

            const msg = `[${data.requestId}] <-- ${data.method} ${data.url} ${this.serialize(data)}`;
            this.logger.info(msg);
        },
        onOutboundResponse: function({ ctx }) {

            const data = Object.assign(
                {
                    status: ctx.status,
                    duration: new Date().getTime() - ctx.startedAt
                },
                ctx.logCtx,
                {
                    log_tag: this.constructor.EVENT.OUTBOUND_RESPONSE
                }
            );
            const msg = `[${data.requestId}] --> ${data.status} ${data.duration}ms ${this.serialize(data)}`;
            this.logger.info(msg);
        },
        onError({ ctx, err }) {
            err.action = `${ctx.request.method}${ctx.request.path}`;
            err.params = {
                query: ctx.request.query,
                body: ctx.request.body,
                log_tag: this.constructor.EVENT.UNEXPECTED_ERROR
            };
            err.context = Object.assign(err.context || {}, ctx.logCtx);

            this.logger.error(err);
        }
    };
};
