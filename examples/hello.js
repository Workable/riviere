const Koa = require('koa');
const riviere = require('riviere');

const app = new Koa();

app.use(riviere());
app.use(async function(ctx) {
  ctx.body = 'Hello World';
});

app.listen(3000);
