const Koa = require('koa');
const riviere = require('../index');
const axios = require('axios');

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
  const body = {
    title: 'foo',
    body: 'bar',
    userId: 1
  };

  await axios.post('https://jsonplaceholder.typicode.com/posts', JSON.stringify(body), {
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      'x-riviere-id': ctx.request.headers['x-riviere-id'] // Please note header keys are lowercased
    }
  });

  ctx.body = 'Hello World';
});

app.listen(3000);
