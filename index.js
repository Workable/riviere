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
  server2server: false,
  getLogCtx: () => {
    return {
      requestId: uuidv4()
    }
  }
};

module.exports = {
  middleware: (...args) => {
    validateArgs(...args);

    const options = args[0];
    lodash.defaults(options, defaultsOptions);

    const logger = options.logger;
    const outboundRequestId = options.outboundRequestId;

    if (options.logOutboundTraffic) {
        http.request = new Proxy(http.request, options.adapter.requestProxy({ logger, outboundRequestId }));
    }

    const loggable = new Loggable(...args);

    return function*(next, ctx = this) {
      ctx.startedAt = new Date().getTime();
      safe(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
      try {
        yield next;
      } catch (err) {
        if (options.errorOptions.stacktrace) {
          this.body = err.stack;
        } else {
          this.body = options.errorOptions.message || err.message;
        }
        this.status = err.status || 500;
        safe(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
      }
      safe(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
    };
  },

  adapter: {
    defaultAdapter
  }
};
