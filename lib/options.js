const defaultAdapter = require('./adapters/default');

const out = require('./appenders/console');

module.exports = (options = {}) => {
  const color = typeof options.color === 'boolean' ? options.color : true;
  const defaultLogger = out({ color });
  return {
    color,
    adapter: defaultAdapter,
    context: ctx => {
      return {};
    },
    errors: {
      enabled: true,
      callback: (ctx, error) => {
        throw error;
      }
    },
    health: [],
    logger: {
      info: defaultLogger,
      error: defaultLogger
    },
    inbound: {
      enabled: true,
      level: 'info',
      includeHost: false
    },
    outbound: {
      enabled: true,
      level: 'info',
      maxQueryChars: undefined,
      maxPathChars: undefined,
      maxHrefChars: undefined,
      // To support axios https request logging
      // (or other similar cases like older nodejs versions),
      // the "request.https" should be proxied in addition
      // to the "request.http".
      https: false
    },
    bodyKeys: [],
    headersRegex: new RegExp('^X-.*', 'i'),
    traceHeaderName: 'X-Riviere-Id',
    forceIds: true
  };
};
