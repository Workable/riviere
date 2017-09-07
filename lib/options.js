const uuidv4 = require('uuid/v4');
const defaultAdapter = require('./adapters/default');

module.exports = {
  adapter: defaultAdapter,
  context: () => ({ requestId: uuidv4() }),
  errors: {
    enabled: true,
    callback: (ctx, error) => {
      ctx.status = error.status || 500;

      if (ctx.status < 500) {
        ctx.body = { error: error.message }
      } else {
        ctx.body = { error: 'Internal server error' };
      }
    }
  },
  health: [{ path: '/', method: 'GET' }],
  logger: {
    info: console.log,
    error: console.error
  },
  inbound: {
    enabled: true,
    level: 'info'
  },
  outbound: {
    enabled: false,
    level: 'info'
  },
  sync: true,
  bodyKeys: [],
  headersRegex: '',
  traceHeaderName: 'X-Riviere-Id'
};
