const log4jsErrorLevel = require('log4js/lib/levels')().ERROR.level;
const _ = require('lodash');
const flat = require('flat');
const serialize = require('../serializers/serializeToKeyValue');

const isLevelError = loggingEvent => loggingEvent.level.level >= log4jsErrorLevel;
const constants = require('../constants');

function stdoutAppender(layout, options) {
    return (loggingEvent) => {
        const { singleLine: errorSingleLine, extraKeys: errorExtraKeys} = options.errors;

        if (isLevelError(loggingEvent) && errorSingleLine) {
            const error = loggingEvent.data[0] || {};
            if (error instanceof Error) {
                error.stack = error.stack.replace(new RegExp('\n', 'g'), ' ');
                const extra = errorExtraKeys ? _.pick(error, errorExtraKeys) : {};
                loggingEvent.data[0] = serialize(flat({
                    extra,
                    msg: error.message,
                    stack: error.stack,
                }));
                return process.stdout.write(`${layout(loggingEvent)}\n`);
            }
        }

        if (!(loggingEvent.data[0] instanceof Error) &&
                typeof loggingEvent.data[0] === 'object' &&
                loggingEvent.data[0] !== undefined) {

            const data = loggingEvent.data[0];
            switch (data.log_tag) {
                case constants.CATEGORY.OUTBOUND_RESPONSE.TAG:
                    loggingEvent.data[0] = `[${data.requestId}] ${constants.CATEGORY.OUTBOUND_RESPONSE.MSG} ${data.method} ${data.path} ${data.status} ${data.duration}ms | ${serialize(data)}`;
                    break;
                case constants.CATEGORY.INBOUND_REQUEST.TAG:
                    loggingEvent.data[0] = `[${data.requestId}] ${constants.CATEGORY.INBOUND_REQUEST.MSG} ${data.method} ${data.path} | ${serialize(data)}`;
                    break;
                case constants.CATEGORY.OUTBOUND_REQUEST.TAG:
                    loggingEvent.data[0] = `[${data.requestId}] ${constants.CATEGORY.OUTBOUND_REQUEST.MSG} ${data.method} ${data.path} | ${serialize(data)}`;
                    break;
                case constants.CATEGORY.INBOUND_RESPONSE.TAG:
                    loggingEvent.data[0] = `[${data.requestId}] ${constants.CATEGORY.OUTBOUND_RESPONSE.MSG} ${data.method} ${data.path} ${data.status} ${data.duration}ms | ${serialize(data)}`;
                   break;
                case constants.CATEGORY.INBOUND_REQUEST_HEALTH.TAG:
                    loggingEvent.data[0] = `${constants.CATEGORY.INBOUND_REQUEST.MSG} ${data.method} ${data.path}`;
                    break;
                case constants.CATEGORY.OUTBOUND_RESPONSE_HEALTH.TAG:
                    loggingEvent.data[0] = `${constants.CATEGORY.OUTBOUND_RESPONSE.MSG} ${data.method} ${data.path} ${data.status} ${data.duration}ms`;
                    break;
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
        }
    };
    return stdoutAppender(layout, options);
}

module.exports = {
    configure
};
