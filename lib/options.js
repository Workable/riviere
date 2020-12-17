const defaultAdapter = require('./adapters/default');
const out = require('./appenders/console');

const { isEmpty } = require('lodash');

module.exports = (options = {}) => {
  const color = typeof options.color === 'boolean' ? options.color : true;
  const styles = !isEmpty(options.styles) ? options.styles : ['simple'];
  const defaultLogger = out({ color, styles });
  return {
    color,
    styles,
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
      request: {
        enabled: true
      },
      level: 'info',
      includeHost: false,
      maxBodyValueChars: undefined
    },
    outbound: {
      enabled: true,
      level: 'info',
      maxQueryChars: undefined,
      maxPathChars: undefined,
      maxHrefChars: undefined,
      maxBodyValueChars: undefined,
      // To support axios https request logging
      // (or other similar cases like older nodejs versions),
      // the "request.https" should be proxied in addition
      // to the "request.http".
      https: false,
      blacklistedPaths: []
    },
    bodyKeys: [],
    bodyKeysRegex: undefined,
    headersRegex: new RegExp('^X-.*', 'i'),
    traceHeaderName: 'X-Riviere-Id',
    forceIds: true
  };
};
