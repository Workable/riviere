const http = require('http');
const defaultsDeep = require('lodash/defaultsDeep');
const Loggable = require('./lib/loggable');
const defaultOptions = require('./lib/options');
const defaultAdapter = require('./lib/adapters/default');
const utils = require('./lib/utils');

const { EVENT } = Loggable;

module.exports = {
  middleware: (options) => {
    const {
      errors,
      logger,
      inbound,
      outbound,
      sync,
      traceHeaderName
    } = defaultsDeep(options, defaultOptions);

    const loggable = new Loggable(options);

    if (outbound.enabled) {
      http.request = new Proxy(http.request, options.adapter.requestProxy({
        level: outbound.level,
        logger,
        traceHeaderName,
        sync
      }));
    }

    return async function(ctx, next) {
      ctx.startedAt = new Date().getTime();

      if (inbound.enabled) {
        utils.safeExec(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
      }

      try {
        await next();
      } catch (err) {
        errors.callback(ctx, err);

        if (errors.enabled) {
          utils.safeExec(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
        }
      }

      if (inbound.enabled) {
        utils.safeExec(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
      }
    };
  },

  adapter: {
    defaultAdapter
  }
};
