const Loggable = require('./lib/loggable');
const defaultAdapter = require('./lib/adapters/defaultAdapter');
const lodash = require('lodash');

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
  adapter: defaultAdapter()
};

module.exports = {
  middleware: (...args) => {
    validateArgs(...args);

    const options = args[0];
    lodash.defaults(options, defaultsOptions);
    const logger = options.logger;
    const { errorOptions = {} } = options;
    const { stacktrace = false, message } = errorOptions;

    const loggable = new Loggable(...args);

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
    defaultAdapter
  }
};
