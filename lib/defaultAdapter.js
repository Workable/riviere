const lodash = require('lodash');
const flat = require('flat');

function getLogStore(ctx) {
  return {
    method: ctx.request.method.toUpperCase(),
    url: ctx.originalUrl,
    size: ctx.req.socket.bytesRead,
    startedAt: new Date().getTime()
  };
}

module.exports = () => {
  return {
    onIncomingRequest: function({ ctx }) {
        ctx.logStore = getLogStore(ctx);
        ctx.logCtx = this.getLogCtx(ctx);

        const { method, url } = ctx.logStore;
        const requestId = ctx.logCtx.requestId;

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

        const meta = Object.assign({ method, url, requestId }, metaHeaders, metaBody);

        ctx.logStore.metaRequest = meta;

        const serializedMeta = this.serialize(
            Object.assign({
                meta,
                log_tag: this.constructor.EVENT.INBOUND_REQUEST
            })
        );

        let msg = '[' + requestId + '] <-- ' + serializedMeta;

        this.logger.info(msg);

    },
    onOutcomingResponse: function({ ctx }) {
        const startedAt = ctx.logStore.startedAt;
        const requestId = ctx.logCtx.requestId;

        const meta = Object.assign(
            {
                status: ctx.status,
                duration: new Date().getTime() - startedAt
            },
            ctx.logStore.metaRequest,
            {
                log_tag: this.constructor.EVENT.OUTBOUND_RESPONSE
            }
        );

        const serializedMeta = this.serialize(meta);

        const message = '[' + requestId + '] --> ' + serializedMeta;

        this.logger.info(message);
    },
    onError({ ctx, err }) {
      const { requestId } = ctx.logCtx;

      err.action = `${ctx.request.method}${ctx.request.path}`;
      err.params = {
        query: ctx.request.query,
        body: ctx.request.body
      };
      err.context = Object.assign(err.context || {}, { requestId });

      this.logger.error(err);
    }
  };
};
