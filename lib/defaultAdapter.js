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

      const serializedRequestMeta = this.serialize({
        log_tag: this.constructor.EVENT.INBOUND_REQUEST
      });

      const serializedLogCtx = this.serialize(ctx.logCtx);

      const { requestId } = ctx.logCtx;

      let msg = '[' + requestId + '] <-- ' + method + ' ' + url + ' ' + this.serialize({ method, url });

      if (method === 'POST' && this.bodyKeys) {
        let metaBody = lodash.pick(ctx.request.body, this.bodyKeys);
        metaBody = flat({ body: metaBody }, { safe: true });
        if (Object.keys(metaBody).length) {
          const serializedMetaBody = this.serialize(metaBody);
          msg += ' ' + serializedMetaBody;
        }
      }

      if (this.headersRegex) {
        const loggedHeaders = {};
        Object.keys(ctx.request.headers).forEach(header => {
          if (this.headersRegex.test(header)) {
            loggedHeaders[header] = ctx.request.headers[header];
          }
        });
        const serializedHeaders = this.serialize(flat({ headers: loggedHeaders }));
        msg += ' ' + serializedHeaders;
      }

      msg += serializedLogCtx + ' ' + serializedRequestMeta;

      this.logger.info(msg);
    },
    onOutcomingResponse: function({ ctx }) {
      const { method, url, startedAt } = ctx.logStore;
      const { requestId } = ctx.logCtx;
      const { status } = ctx;

      const duration = new Date().getTime() - startedAt;
      const responseMeta = Object.assign({ status, duration, method, url }, ctx.logCtx, {
        log_tag: this.constructor.EVENT.OUTBOUND_RESPONSE
      });

      const message = '[' + requestId + '] --> ' + method + ' ' + url + ' ' + this.serialize(responseMeta);

      this.logger.info(message);
    },
    onError({ ctx, err }) {
      const { method } = ctx.logStore;
      const { requestId } = ctx.logCtx;

      err.action = `${method}${ctx.request.path}`;

      err.params = {
        query: ctx.request.query,
        body: ctx.request.body
      };

      err.context = Object.assign(err.context || {}, { requestId });

      this.logger.error(err);
    }
  };
};
