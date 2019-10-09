const defaultAdapter = require('./adapters/default');
const out = require('./appenders/console');

const { isEmpty } = require('lodash');

module.exports = (options = {}) => {
  const color = typeof options.color === 'boolean' ? options.color : true;
  const appendTag = typeof options.appendTag === 'boolean' ? options.appendTag : true;
  const styles = !isEmpty(options.styles) ? options.styles : ['simple'];
  const defaultLogger = out({ color, appendTag, styles });
  return {
    color,
    appendTag,
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
