const defaultsDeep = require('lodash/defaultsDeep');
const Loggable = require('./lib/loggable');
const defaultOptions = require('./lib/options');
const utils = require('./lib/utils');
const httpProxy = require('./lib/proxies/http').proxy;
const httpsProxy = require('./lib/proxies/https').proxy;

const { EVENT } = Loggable;

module.exports = {
  middleware: (options = {}) => {
    const { errors = {}, logger, inbound, outbound, traceHeaderName } = defaultsDeep(options, defaultOptions(options));

    const loggable = new Loggable(options);

    if (outbound.enabled) {
      const handler = options.adapter.requestProxy({ level: outbound.level, logger, traceHeaderName, opts: outbound });
      httpProxy(handler);

      if (outbound.https) {
        httpsProxy(handler);
      }
    }

    return async function(ctx, next) {
      ctx.riviereStartedAt = new Date().getTime();

      if (inbound.enabled) {
        utils.safeExec(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
      }

      try {
        await next();
      } catch (err) {
        if (errors.enabled) {
          utils.safeExec(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
        }

        if (typeof errors.callback === 'function') {
          errors.callback(ctx, err);
        }
      }

      if (inbound.enabled) {
        utils.safeExec(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
      }
    };
  }
};
