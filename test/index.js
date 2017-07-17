const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const log4js = require('log4js');

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
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[[%d] [%p] %c%] %m'
            }
        },
        honeybadger: {
            type: 'log4js_honeybadger_appender'
        }
    },
    categories: {
        default: { appenders: [ 'console', 'honeybadger' ], level: 'info' }
    }
});

const riviere = Riviere.middleware({
    logger: log4js.getLogger(),
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
