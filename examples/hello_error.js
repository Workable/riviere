const Koa = require('koa');

const Riviere = require('riviere');

const app = new Koa();

app.use(Riviere.middleware());
app.use(async function() {
  throw new Error('something bad happened');
});

app.listen(3000);
