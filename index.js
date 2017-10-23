const http = require('http');
const defaultsDeep = require('lodash/defaultsDeep');
const Loggable = require('./lib/loggable');
const defaultOptions = require('./lib/options');
const utils = require('./lib/utils');

const { EVENT } = Loggable;

module.exports = {
  middleware: (options = {}) => {
    const { errors, logger, outbound, traceHeaderName } = defaultsDeep(options, defaultOptions(options));

    const loggable = new Loggable(options);

    if (outbound.enabled) {
      http.request = new Proxy(
        http.request,
        options.adapter.requestProxy({
          level: outbound.level,
          logger,
          traceHeaderName
        })
      );
    }

    return async function(ctx, next) {
      ctx.riviereStartedAt = new Date().getTime();

      utils.safeExec(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);

      try {
        await next();
      } catch (err) {
        errors.callback(ctx, err);
        utils.safeExec(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
      }

      utils.safeExec(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
    };
  }
};
