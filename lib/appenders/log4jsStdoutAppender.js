const log4jsErrorLevel = require('log4js/lib/levels')().ERROR.level;
const _ = require('lodash');
const flat = require('flat');
const serialize = require('../serializers/serialzeToKeyValue');

const isLevelError = loggingEvent => loggingEvent.level.level >= log4jsErrorLevel;

function stdoutAppender(layout, options) {
    return (loggingEvent) => {
        if (isLevelError(loggingEvent) && options.singleLineErrorStack) {
            const error = loggingEvent.data[0] || {};
            if (error instanceof Error) {
                error.stack = error.stack.replace(new RegExp('\n', 'g'), ' ');
                const extra = _.pick(error, options.includeKeys);
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
        singleLineErrorStack: config.singleLineErrorStack || false,
        includeKeys: config.includeKeys || []
    };
    return stdoutAppender(layout, options);
}

module.exports = {
    configure
};
