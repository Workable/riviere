const Koa = require('koa');
const riviere = require('riviere');

const app = new Koa();

app.use(
  riviere({
    errors: {
      callback: (ctx, err) => {
        console.log('errors.callback()');
        throw err;
      }
    }
  })
);

app.use(async function() {
  throw new Error('something bad happened');
});

app.listen(3000);
