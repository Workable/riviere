const Koa = require('koa');
const riviere = require('../index');
const request = require('request-promise');

const app = new Koa();

app.use(
  riviere({
    outbound: {
      enabled: true
    },
    styles: ['extended'],
    headerValueCallback: (key, value) => {
      const regex = /id_token=[\w-]+\.[\w-]+\.[\w-]+/i;
      return value.replace(regex, 'id_token=***');
    }
  })
);

app.use(async function(ctx) {
  ctx.body = 'Hello World';
  ctx.set('x-something', 'id_token=some.token.to-hide');
});

app.listen(3000);
