const Loggable = require('./lib/loggable');
const defaultAdapter = require('./lib/defaultAdapter');

const { EVENT } = Loggable;

function validateArgs(options) {
  const { adapter, logger } = options;
  if (!adapter || !adapter.onIncomingRequest || !adapter.onOutcomingResponse || !adapter.onError) {
    throw new Error('no_valid_adapter');
  }
  if (!logger) {
    throw new Error('no_valid_logger');
  }
}

module.exports = {
  middleware: (...args) => {
    validateArgs(...args);

    const loggable = new Loggable(...args);

    return function*(next, ctx = this) {
      loggable.emit(EVENT.INBOUND_REQUEST, { ctx });

      try {
        yield next;
      } catch (err) {
        this.status = err.status || 500;

        loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err });
      }

      loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx });
    };
  },

  adapter: {
    defaultAdapter
  }
};
