const Koa = require('koa');
const riviere = require('../index');

const app = new Koa();

app.use(riviere());
app.use(function() {
  throw new Error('something went wrong');
});

app.listen(3000);
