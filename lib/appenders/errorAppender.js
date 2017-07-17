const flatstr = require('flatstr');

function configure() {
    return logEvent => {
        const data = logEvent.data;
        const err = data[0];
        const errCtx = {
            action: err.action,
            component: err.component,
            context: err.context
        };
        const msg = `[${logEvent.startTime.toISOString()}] [${logEvent.level.levelStr}] [${logEvent.categoryName}] [${errCtx.context.requestId}] ERROR ${err.message} ${JSON.stringify(errCtx)} stack_trace ${err.stack.replace(/\n/g,' ')}\n`;
        process.stdout.write(flatstr(msg));
    };
}

module.exports = {
    configure
};
