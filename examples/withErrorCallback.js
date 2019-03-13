const Koa = require('koa');
const riviere = require('../index');

const app = new Koa();

app.use(
  riviere({
    errors: {
      callback: (err, ctx) => {
        // eslint-disable-next-line no-console
        console.error(`ERROR at ${ctx.path}:`, err);
      }
    }
  })
);

app.use(function() {
  throw new Error('something bad happened');
});

app.listen(3000);
