const Koa = require('koa');
const riviere = require('riviere');

const app = new Koa();

app.use(
  riviere({
    errors: {
      // i dont want to rethrow any unhandled errors here
      callback: (ctx, err) => null
    }
  })
);
app.use(async function() {
  throw new Error('something bad happened');
});

app.listen(3000);
