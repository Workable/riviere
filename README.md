# riviere[![Coverage Status](https://coveralls.io/repos/github/Workable/riviere/badge.svg?branch=master)](https://coveralls.io/github/Workable/riviere?branch=master)

Trace HTTP requests and server errors.

Riviere is a koa middleware that decorates your middleware chain with inbound request/response and error logging.

## Features

- Log inbound request/responses made from web clients to your server
- Log outbound request/responses made from your server to other microservices
- Works any logger and is fully customizable due to plugable adapters
- Winston like key=value log format by default (default configuration)
- String values are escaped correctly (Logentries friendly)
- Include custom headers in every log entry
- Include hand-picked keys from request body in every log entry
- Catch and log errors that might occur during the req/res lifecycle
- Enhanche the unexpected errors with the request context (HoneyBadger frendly)
- Works with koa 2.x and koa 1.x

## Installation

```npm i --save riviere```

## Usage

```js
const Koa = require('koa'); // koa version 1
const app = new Koa();
const riviere = require('riviere');

// pass riviere options here
const options = {
  // ...
};

app.use(riviere(options));

app.use(function*(next) {
  this.body = 'Hello World';
  yield next;
});

app.listen(3000);

```

## Configuration

### Available options:

**adapter**

Customize functionality by implementing a custom adapter. Defaults to `defaultAdapter.js`

*Example*
```js
{
  onInboundRequest: () => console.log('incoming request');
  onOutboundResponse() => console.log('outbound response');
  onError() => console.log('error');
}
```

**context**

The context to be included in every log entry. Defaults to `{ requestId: uuidv4() }`


**errors**

Error logging configuration

**errors.enabled**

Control if error logging is enabled. Defaults to `true`.

**errors.callback**

Control how the server responds to unexpected errors

*Example of the default callback*

```js
(ctx, error) => {
  ctx.status = error.status || 500;

  if (ctx.status < 500) {
    ctx.body = {
      error: error.message
    }
  } else {
    ctx.body = {
      error: 'Internal server error'
    };
  }
}
```

**health**

Specify your health endpoints in order to log a minimum subset of information. Defaults to `[]`.

*Example*

```js
[
  { path: '/health', method: 'GET' }
]
```

**logger**

Pass the logger object

*Example of the default logger*

```js
{
  info: console.log,
  error: console.error
}
```

**inbound**

Inbound HTTP traffic configuration

**inbound.enabled**

Control if logging for inbound HTTP traffic is enabled. Defaults to `true`.

**inbound.info**

Set the log level for inbound HTTP traffic. Defaults to `info`.

**outbound**

Outbound HTTP traffic configuration

**outbound.enabled**

Control if logging for outbound HTTP traffic is enabled. Defaults to `false`.

**outbound.info**

Set the log level for outbound HTTP traffic. Defaults to `info`.

**sync**

Control whether logs should be flushed in a sync or async fashion (experimental). Defaults to `true`.

**bodyKeys**

Pass an array of body keys that should be included in every log entry. Defaults to `[]`.

**headersRegex**

Specify a regular expression to match request headers that should be included in every log entry. Defaults to `''`.

*Example*

```js
{
  headersRegex: /X-.+/ to match all custom HTTP headers.
}
```

**traceHeaderName**

Custom header to correlate inbound and outbound HTTP traffic. Defaults to `X-Riviere-Id`.


## Example logs

```
[773572f2-6c3a-4d75-bdfa-0123bdff62c4] <-- POST /api/v1/somethingElse?someparam=ok userId="exampleUserId", accountId="exampleAccountId", requestId="773572f2-6c3a-4d75-bdfa-0123bdff62c4", method="POST", url="/api/v1/somethingElse?someparam=ok", headers.x-custom-user="exampleUserId", headers.x-custom-account="exampleAccountId", headers.x-request-id="exampleRequestId", body.sport_type ="sea", body.equipment=["paddle", "SUP board", "sunglasses"], log_tag="inbound_request"
```

```
[773572f2-6c3a-4d75-bdfa-0123bdff62c4] --> 200 9ms status=200, duration=9, userId="exampleUserId", accountId="exampleAccountId", requestId="773572f2-6c3a-4d75-bdfa-0123bdff62c4", method="POST", url="/api/v1/somethingElse?someparam=ok", log_tag="outbound_response"
```

## License

  MIT
