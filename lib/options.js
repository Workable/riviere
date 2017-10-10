const uuidv4 = require('uuid/v4');
const defaultAdapter = require('./adapters/default');

const out = require('./appenders/console');

module.exports = (options = {}) => {
  const color = typeof options.color === 'boolean' ? options.color : true;
  const defultLogger = out({ color });
  return {
    adapter: defaultAdapter,
    context: ctx => {
      return {};
    },
    errors: {
      enabled: true,
      callback: (ctx, error) => {
        ctx.status = error.status || 500;

        if (ctx.status < 500) {
          ctx.body = { error: error.message };
        } else {
          ctx.body = { error: 'Internal server error' };
        }
      }
    },
    health: [],
    logger: {
      info: defultLogger,
      error: defultLogger
    },
    inbound: {
      enabled: true,
      level: 'info'
    },
    outbound: {
      enabled: true,
      level: 'info'
    },
    sync: true,
    bodyKeys: [],
    headersRegex: new RegExp('^X-.*', 'i'),
    traceHeaderName: 'X-Riviere-Id'
  };
};
