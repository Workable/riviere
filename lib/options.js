const defaultAdapter = require('./adapters/default');

const out = require('./appenders/console');

module.exports = (options = {}) => {
  const color = typeof options.color === 'boolean' ? options.color : true;
  const defultLogger = out({ color });
  return {
    color,
    adapter: defaultAdapter,
    context: ctx => {
      return {};
    },
    errors: {
      callback: (ctx, error) => {
        throw error;
      }
    },
    health: [],
    logger: {
      info: defultLogger,
      error: defultLogger
    },
    inbound: {
      level: 'info'
    },
    outbound: {
      enabled: true,
      level: 'info'
    },
    bodyKeys: [],
    headersRegex: new RegExp('^X-.*', 'i'),
    traceHeaderName: 'X-Riviere-Id',
    forceIds: true
  };
};
