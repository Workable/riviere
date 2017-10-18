const Koa = require('koa');
const Riviere = require('riviere');
const rp = require('request-promise');

const app = new Koa();

app.use(Riviere.middleware());
app.use(async function(ctx) {
  await rp({
    uri: 'https://www.google.com',
    headers: {
      'X-Riviere-Id': ctx.request.headers['x-riviere-id']
    }
  });
  ctx.body = 'Hello World';
});

app.listen(3000);
