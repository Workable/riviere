const Koa = require('koa');
const riviere = require('../index');
const request = require('request-promise');

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
  var options = {
    method: 'POST',
    uri: 'https://jsonplaceholder.typicode.com/posts',
    body: {
      title: 'foo',
      body: 'bar',
      userId: 1
    },
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'X-Riviere-Id': ctx.request.headers['x-riviere-id'] // Please note header keys are lowercased
    },
    json: true
  };

  await request(options);

  ctx.body = 'Hello World';
});

app.listen(3000);
