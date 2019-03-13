const Koa = require('koa');
const riviere = require('riviere');

// this is just an example, you can use any http library
const rp = require('request-promise');

const app = new Koa();

app.use(riviere());
app.use(async function(ctx) {
  await rp({
    uri: 'https://www.google.com',
    // You can include the X-Riviere-Id header
    // to trace the request's context inside which
    // the external request is made
    // This is optional but recommended for better tracing:
    headers: {
      'X-Riviere-Id': ctx.request.headers['x-riviere-id'] // notice that this is lowercase
    }
  });
  ctx.body = 'Hello World';
});

app.listen(3000);
