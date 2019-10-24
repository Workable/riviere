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
    styles: ['simple', 'json']
  })
);

app.use(async function(ctx) {
  var options = {
    method: 'PUT',
    uri: 'https://jsonplaceholder.typicode.com/posts/1',
    body: {
      id: 1,
      title: 'foooooooo',
      body: 'baraaaaaaaaa',
      userId: 134
    },
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'x-riviere-id': ctx.request.headers['x-riviere-id'] // Please note header keys are lowercased
    },
    json: true
  };

  await request(options);

  ctx.body = 'Hello World';
});

app.listen(3000);
