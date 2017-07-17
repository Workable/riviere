const flatstr = require('flatstr');

const serialize = require('./../serializers/serialzeToKeyValue');

function configure() {
    return logEvent => {
        const data = logEvent.data;
        const ctx = data[1] || {};
        const msg = `[${logEvent.startTime.toISOString()}] [${logEvent.level.levelStr}] [${logEvent.categoryName}] [${ctx.requestId}] --> ${ctx.status} ${ctx.duration}ms ${serialize(ctx)}\n`;
        process.stdout.write(flatstr(msg));
    };
}

module.exports = {
    configure
};
