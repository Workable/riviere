const Koa = require('koa');
const riviere = require('riviere');

const app = new Koa();

app.use(riviere());
app.use(async function() {
  throw new Error('something went wrong');
});

app.listen(3000);
