const Koa = require('koa');
const riviere = require('../index');

const app = new Koa();

app.use(riviere({ styles: ['extended'] }));

app.use(function(ctx) {
  ctx.body = 'Hello World';
});

app.listen(3000);
