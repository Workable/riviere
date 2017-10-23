const log4jsErrorLevel = require('log4js/lib/levels')().ERROR.level;
const _ = require('lodash');
const flat = require('flat');

const serialize = require('../serializers/toKeyValue');
const logTags = require('../logTags');
const getFormat = require('./format');

const isLevelError = loggingEvent => loggingEvent.level.level >= log4jsErrorLevel;

function stdoutAppender(layout, options) {
  const format = getFormat(options.color);
  return loggingEvent => {
    const { singleLine: errorSingleLine, extraKeys: errorExtraKeys } = options.errors;

    if (isLevelError(loggingEvent) && errorSingleLine) {
      const error = loggingEvent.data[0] || {};
      if (error instanceof Error) {
        error.stack = error.stack.replace(new RegExp('\n', 'g'), ' ');
        const extra = errorExtraKeys ? _.pick(error, errorExtraKeys) : {};
        const loggingEventClone = _.cloneDeep(loggingEvent);
        loggingEventClone.data[0] = serialize(
          flat({
            extra,
            msg: error.message,
            stack: error.stack
          })
        );
        return process.stdout.write(`${layout(loggingEventClone)}\n`);
      }
    }

    if (
      !(loggingEvent.data[0] instanceof Error) &&
      typeof loggingEvent.data[0] === 'object' &&
      loggingEvent.data[0] !== undefined
    ) {
      const data = loggingEvent.data[0];
      const formatMsg = format[data.log_tag];
      if (formatMsg && typeof formatMsg === 'function') {
        loggingEvent.data[0] = formatMsg(data);
      }
    }

    return process.stdout.write(`${layout(loggingEvent)}\n`);
  };
}

function configure(config, layouts) {
  let layout = layouts.basic;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  const options = {
    errors: config.errors || {
      singleLine: false,
      extraKeys: []
    },
    color: !!config.color
  };
  return stdoutAppender(layout, options);
}

module.exports = {
  configure
};
