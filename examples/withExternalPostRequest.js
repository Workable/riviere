const Koa = require('koa');
const riviere = require('../index');

const app = new Koa();

app.use(
  riviere({
    outbound: {
      https: true
    },
    bodyKeys: ['title', 'userId'],
    styles: ['simple']
  })
);

app.use(async function(ctx) {
  await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'x-riviere-id': ctx.request.headers['x-riviere-id'] // Please note header keys are lowercased
    },
    body: JSON.stringify({
      title: 'foo',
      body: 'bar',
      userId: 1
    })
  });

  ctx.body = 'Hello World';
});

app.listen(3000);
