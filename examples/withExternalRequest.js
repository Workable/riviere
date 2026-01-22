const Koa = require('koa');
const riviere = require('../index');

const app = new Koa();

app.use(
  riviere({
    outbound: {
      https: true
    }
  })
);

app.use(async function(ctx) {
  await fetch('https://www.google.com', {
    // You can include the X-Riviere-Id header to trace the request's context inside which
    // the external request is made. This is optional but recommended for better tracing:
    headers: {
      'x-riviere-id': ctx.request.headers['x-riviere-id'] // Please note header keys are lowercased
    }
  });

  ctx.body = 'Hello World';
});

app.listen(3000);
