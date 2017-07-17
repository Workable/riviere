# riviere

Nodejs koa HTTP Middleware compatible with the logger of your choice.

## Installation

```npm i --save riviere```

## Usage

```
const Koa = require('koa'); // koa version 1
const app = new Koa();
const Riviere = require('riviere');

const myLogger = {
    info: (msg) => console.log(msg),
    error: (err) => console.log(err)
};

const options = {
    logger: myLogger
}
const riviere = Riviere.middleware(options);

app.use(riviere);

app.use(function*(next) {
    this.body = 'Hello World';
    yield next;
});

app.listen(3000);

```

# Configuration
```
// pass the options argument 
const riviere = Riviere.middleware(options);
```

# Available Options
- **logger** | required | This will be used from the defaultAdapter
- **headersRegex** | optional | The request headers to be logged(regex)
- **bodyKeys** | optional | the JSON body fields to be logged
- **getLogCtx** | optional | the ctx context to be logged
- **adapter** | optional | customize the functionality by implementing a custom adapter

Options Example:
```
const options = {
    logger, // required
    headersRegex: new RegExp('^x-.*', 'i'),
    bodyKeys: ['cars', drivers'],
    getLogCtx: (ctx) => {
        return {
            userId: 'exampleUserId',
            accountId: 'exampleAccountId',
            requestId: 'ExampleRequestId'
        };
    },
    adapter: {
        onInboundRequest: () => console.log('incoming request');
        onOutboundResponse() => console.log('outbound response');
        onError() => console.log('error');
    }
};
```
# Features
- Use the logger of your choice.
- Log the inbound HTTP request.
- Log therequest headers (Configurable). By default all X-.* headers will be logged.
- Log the request body (Configurable).
- Log request context (Configurable).
- Log the outbound HTTP response.
- Extensible by implementing adapters.
- Handle unexpected errors.

## License

  MIT
