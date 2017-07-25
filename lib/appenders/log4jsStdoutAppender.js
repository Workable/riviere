const log4jsErrorLevel = require('log4js/lib/levels')().ERROR.level;
const _ = require('lodash');
const flat = require('flat');
const serialize = require('../serializers/serializeToKeyValue');

const isLevelError = loggingEvent => loggingEvent.level.level >= log4jsErrorLevel;

function stdoutAppender(layout, options) {
    return (loggingEvent) => {
        const { singleLine: errorSingleLine, extraKeys: errorExtraKeys} = options.errors;
        if (isLevelError(loggingEvent) && errorSingleLine) {
            const error = loggingEvent.data[0] || {};
            if (error instanceof Error) {
                error.stack = error.stack.replace(new RegExp('\n', 'g'), ' ');
                const extra = errorExtraKeys ? _.pick(error, errorExtraKeys) : {};
                loggingEvent.data[0] = serialize(flat({
                    msg: error.message,
                    stack: error.stack,
                    extra
                }));
            }
        }
        process.stdout.write(`${layout(loggingEvent)}\n`);
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
        }
    };
    return stdoutAppender(layout, options);
}

module.exports = {
    configure
};
