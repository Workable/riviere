const Loggable = require('./lib/loggable');
const defaultAdapter = require('./lib/adapters/defaultAdapter');
const log4jsAdapter = require('./lib/adapters/log4jsAdapter');
const lodash = require('lodash');

const { EVENT } = Loggable;

function validateArgs(options) {
  const { adapter, logger } = options;
  if (!adapter || !adapter.onInboundRequest || !adapter.onOutboundResponse || !adapter.onError) {
    throw new Error('invalid_adapter');
  }
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
  defaultHeadersRegex: new RegExp('^x-.*', 'i')
};

module.exports = {
  middleware: (...args) => {
    validateArgs(...args);

    const loggable = new Loggable(...args);

    const options = args[0];
    lodash.defaults(options, defaultsOptions);
    const logger = options.logger;
    const { errorOptions = {} } = options;
    const { stacktrace = false, message } = errorOptions;

    return function*(next, ctx = this) {
      ctx.startedAt = new Date().getTime();
      safe(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
      try {
        yield next;
      } catch (err) {
        if (stacktrace) {
          this.body = err.stack;
        } else {
          this.body = message || err.message;
        }
        this.status = err.status || 500;
        safe(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
      }
      safe(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
    };
  },

  adapter: {
    defaultAdapter,
    log4jsAdapter
  }
};
