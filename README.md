Work in Progress...

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
- **bodyKeys** | optional | The JSON body fields to be logged
- **getLogCtx** | optional | The context to be logged
- **adapter** | optional | Customize functionality by implementing a custom adapter
- **serialize** | optional | Define the format of the logged context

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
- Customizable by implementing adapters.
- Catch unexpected errors.
- Enhanche the unexpected errors with the request context (HoneyBadger frendly)
- Supports a winston like key=value log Format by default. The string values are wrapped inside double quotes (Logentries friendly).

# Example logs

```
[773572f2-6c3a-4d75-bdfa-0123bdff62c4] <-- POST /api/v1/somethingElse?someparam=ok userId="exampleUserId", accountId="exampleAccountId", requestId="773572f2-6c3a-4d75-bdfa-0123bdff62c4", method="POST", url="/api/v1/somethingElse?someparam=ok", headers.x-custom-user="exampleUserId", headers.x-custom-account="exampleAccountId", headers.x-request-id="exampleRequestId", body.sport_type ="sea", body.equipment=["paddle", "SUP board", "sunglasses"], log_tag="inbound_request"
```

```
[773572f2-6c3a-4d75-bdfa-0123bdff62c4] --> 200 9ms status=200, duration=9, userId="exampleUserId", accountId="exampleAccountId", requestId="773572f2-6c3a-4d75-bdfa-0123bdff62c4", method="POST", url="/api/v1/somethingElse?someparam=ok", log_tag="outbound_response"
```

## License

  MIT
