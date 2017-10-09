const Koa = require('koa');

const Riviere = require('../index');

const app = new Koa();

app.use(Riviere.middleware());
app.use(async function(ctx) {
  ctx.body = 'Hello World';
});

app.listen(3001);
