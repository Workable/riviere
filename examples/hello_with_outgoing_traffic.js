const Koa = require('koa');
const rp = require('request-promise');

const riviere = require('../index');

const app = new Koa();

app.use(riviere.middleware());
app.use(async function(ctx) {
  await rp({
    uri: 'https://www.google.com',
    headers: {
      'X-Riviere-Id': ctx.headers['X-Riviere-Id']
    }
  });
  ctx.body = 'Hello World';
});

app.listen(3001);
