const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const log4js = require('log4js');
const path = require('path');

const Riviere = require('./../index');

const logger = {
    info: (...args) => {
        console.log(...args)
    },
    error: (...args) => {
        console.log(...args);
    }
};

const getLogCtx = (ctx) => {
    return {
        userId: 'exampleUserId',
        accountId: 'exampleAccountId',
        requestId: 'ExampleRequestId'
    };
};

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        inbound: {
            type: path.join(__dirname, '../lib/appenders/inboundAppender'),
        },
        outbound: {
            type: path.join(__dirname, '../lib/appenders/outboundAppender')
        },
        error: {
            type: path.join(__dirname, '../lib/appenders/errorAppender')
        },
        honeybadger: {
            type: path.join(__dirname, '../lib/appenders/honeyBadgerAppender')
        }
    },
    categories: {
        default: { appenders: [ 'out' ], level: 'info' },
        inbound: { appenders: [ 'inbound' ], level: 'info' },
        outbound: { appenders: [ 'outbound' ], level: 'info' },
        error: { appenders: [ 'error', 'honeybadger' ], level: 'error' }
    }
});

const riviere = Riviere.middleware({
    logger: log4js.getLogger(),
    adapter: Riviere.adapter.log4jsAdapter(),
    getLogCtx: ctx => {
        return {
            method: ctx.request.method.toUpperCase(),
            url: ctx.originalUrl,
            userId: 'exampleUserId',
            accountId: 'exampleAccountId',
            requestId: 'ExampleRequestId'
        };
    },
    bodyKeys: ['skills', 'edu', 'exp', 'loc', 'lastPageFallback'],
    headersRegex: new RegExp('^x-.*', 'i'),
    errorOptions: {
        stacktrace: false,
        message: 'something went wrong'
    }

});

const app = new Koa();

app.use(bodyParser({ enableTypes: ['json'] }));

app.use(riviere);

app.use(function*(next) {
    //throw new Error('omg');
    this.body = 'Hello World';
    yield next;
});

app.listen(3000);
