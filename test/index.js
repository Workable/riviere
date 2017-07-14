const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const Riviere = require('./../index');

const logger = {
    info: (...args) => {
        console.log(...args)
    },
    error: (...args) => {
        console.log(...args);
    }
};

const riviere = Riviere.middleware({
    logger: logger,
    adapter: Riviere.adapter.defaultAdapter(),
    getLogCtx: ctx => {
        return {
            userId: 'exampleUserId',
            accountId: 'exampleAccountId',
            requestId: 'ExampleRequestId'
        };
    },
    bodyKeys: ['skills', 'edu', 'exp', 'loc', 'lastPageFallback'],
    headersRegex: new RegExp('^x-.*', 'i')
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
