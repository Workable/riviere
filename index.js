const Loggable = require('./lib/loggable');
const defaultAdapter = require('./lib/adapters/default');
const uuidv4 = require('uuid/v4');
const lodash = require('lodash');
const http = require('http');

const { EVENT } = Loggable;

function validateArgs(options) {
  const { logger } = options;
  if (!logger) {
    throw new Error('invalid_logger');
  }
}

function safe(fn, log) {
  try {
    fn();
  } catch (err) {
    log.error(err);
  }
}

const defaultsOptions = {
  headersRegex: new RegExp('^x-.*', 'i'),
  adapter: defaultAdapter,
  outbound: {
    enabled: false,
    level: 'info'
  },
  inbound: {
    enabled: true, // todo: right now this value is being ignored
    level: 'info'
  },
  getLogCtx: () => {
    return {
      requestId: uuidv4()
    };
  },
  sync: false
};

module.exports = {
  middleware: (...args) => {
    validateArgs(...args);

    const options = args[0];
    lodash.defaultsDeep(options, defaultsOptions);

    const { logger, outboundRequestId, sync} = options;

    const level = options.outbound.level;

    if (options.outbound.enabled) {
      http.request = new Proxy(http.request, options.adapter.requestProxy({
        logger,
        level,
        outboundRequestId,
        sync
      }));
    }

    const loggable = new Loggable(...args);

    return async function(ctx, next) {
      ctx.startedAt = new Date().getTime();
      safe(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
      try {
        await next();
      } catch (err) {
        if (options.errorOptions.stacktrace) {
          ctx.body = err.stack;
        } else {
          ctx.body = options.errorOptions.message || err.message;
        }
        ctx.status = err.status || 500;
        safe(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
      }
      safe(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
    };
  },

  adapter: {
    defaultAdapter
  }
};
