const log4jsErrorLevel = require('log4js/lib/levels')().ERROR.level;
const _ = require('lodash');
const flat = require('flat');
const serialize = require('../serializers/serializeToKeyValue');

const isLevelError = loggingEvent => loggingEvent.level.level >= log4jsErrorLevel;

const MSG = {
    INBOUND_REQUEST: '<--',
    OUTBOUND_RESPONSE: '-->',
    OUTBOUND_REQUEST: '->',
    INBOUND_RESPONSE: '<-'
};

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
                case 'outbound_response':
                    loggingEvent.data[0] = `[${data.requestId}] ${MSG.OUTBOUND_RESPONSE} ${data.method} ${data.path} ${data.status} ${data.duration}ms | ${serialize(data)}`;
                    break;
                case 'inbound_request':
                    loggingEvent.data[0] = `[${data.requestId}] ${MSG.INBOUND_REQUEST} ${data.method} ${data.path} | ${serialize(data)}`;
                    break;
                case 'outbound_request':
                    loggingEvent.data[0] = `[${data.requestId}] ${MSG.OUTBOUND_REQUEST} ${data.method} ${data.path} | ${serialize(data)}`;
                    break;
                case 'inbound_response':
                    loggingEvent.data[0] = `[${data.requestId}] ${MSG.INBOUND_RESPONSE} ${data.method} ${data.path} ${data.status} ${data.duration}ms | ${serialize(data)}`;
                   break;
                case 'inbound_request_health':
                    loggingEvent.data[0] = `${MSG.INBOUND_REQUEST} ${data.method} ${data.path}`;
                    break;
                case 'outbound_response_health':
                    loggingEvent.data[0] = `${MSG.OUTBOUND_RESPONSE} ${data.method} ${data.path} ${data.status} ${data.duration}ms`;
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
