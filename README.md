# riviere

[![Coverage Status](https://coveralls.io/repos/github/Workable/riviere/badge.svg?branch=master)](https://coveralls.io/github/Workable/riviere?branch=master)

Riviere decorates your `Koa` middleware chain with inbound/outbound HTTP traffic logs.

---

# Table of contents
1. [Features](#Features)
2. [Example logs](#Example_logs)
3. [Requirements](#Requirements)
4. [Installation](#Installation)
5. [Usage](#Usage)
6. [Configuration](#Configuration)
7. [Available Options](#Available_options)
    1. [bodyKeys](#options_body_keys)
    2. [color](#options_color)
    3. [context](#options_context)
    4. [errors.callback](#options_errors_callback)
    5. [errors.enabled](#options_errors_enabled)               
    6. [headersRegex](#options_headers_regex)
    7. [health](#options_health)
    8. [inbound.enabled](#options_inbound_enabled)
    9. [outbound.enabled](#options_outbound_enabled)
    10. [traceHeaderName](#options_trace_header_name)
8. [License](#License)    

---

<a name="Features"></a>
## Features

- Log all the HTTP(s) requests tha are coming into your server and the corresponding responses.
  (`inbound_request`/`outbound_response`)
- Log all the HTTP(s) requests that your server sends to any external systems and the corresponding responses.
  (`outbound_request`/`inbound_response`)
- Log any unhandled error that is thrown inside a requests's context.

Upcoming Features:
- Support any logger that is able to format json objects into log messages (like log4js, winston, pino, etc ...)
- Support Express
---

<a name="Example_logs"></a>
## Example logs 

![alt text](https://github.com/Workable/riviere/blob/images/images/riviere_logs_screen_2.png)

---

<a name="Requirements"></a>
## Requirements

* Node version >= 8
* Koa version >= 2

---

<a name="Installation"></a>
## Installation

```npm i --save riviere```

---

<a name="Usage"></a>
## Usage

*Example*:

```js
const Koa = require('koa');
const Riviere = require('riviere');

const app = new Koa();

app.use(Riviere.middleware());
app.use(async function(ctx) {
    ctx.body = 'Hello World';
});

app.listen(3000);
```

*Example with outbound HTTP traffic*:

```js
const Koa = require('koa');
const Riviere = require('riviere');

// this is just an example, you can use any http library
const rp = require('request-promise');

const app = new Koa();

app.use(Riviere.middleware());
app.use(async function(ctx) {
  await rp({
    uri: 'https://www.google.com',
    // You can include the X-Riviere-Id header
    // to trace the request's context inside which
    // the external request is made
    // This is optional but recommended for better tracing:
    headers: {
      'X-Riviere-Id': ctx.headers['X-Riviere-Id']
    }
  });
  ctx.body = 'Hello World';
});

app.listen(3000);
```

---

<a name="Configuration"></a>
## Configuration

The behavior of the riviere middleware can be configured by passing a configuration object,
as argument to the `Riviere.middleware()` method call.

*Example*:
```js
const riviereConfObj = {}; 
app.use(Riviere.middleware(riviereConfObj));
```

The supported key-value options, for the configuration object are described below.

---

<a name="Available_options"></a>
### Available options

<a name="options_body_keys"></a>
**bodyKeys**

This option can be used to log specific values from the `JSON` body of the `inbound` `POST` requests.
Defaults to empty Array `[]`. 
To use this option, the `POST` request's body should be a valid `JSON`.
Most often this mean that you should register the `Koa` `bodyParser` middleware
(https://www.npmjs.com/package/body-parser) (or something equivalent), 
before registering the `riviere` middleware.

*Example*:

```js
{
    bodyKeys: [ 
        'education', 
        'work_experience'
    ]
}
```

<a name="options_color"></a>
**color**

Log colored log messages. Defaults to: `true`

*Example*:
```js
{
    color: true
}
```

<a name="options_context"></a>
**context**

The context to be included in every `inbound_request` and `outbound_response`
log message. Defaults to empty Object: `{}`.

*Example*:

```js
{
    context: (ctx) => {
        return {
            userId: ctx.request.headers['user-id'],
            accountId: ctx.request.headers['account-id']
        };
    }
}
```

<a name="options_errors"></a>
**errors**

Unhandled Error inside a request's context 

<a name="options_errors_callback"></a>
**errors.callback**

Control how the server handles any unhandled errors inside a request's context.
The default handler is being shown in the following example.

*Example*:

```js
{
    errors: {
        callback: (ctx, error) => {
            ctx.status = error.status || 500;
        
            if (ctx.status < 500) {
                ctx.body = {error: error.message};
            } else {
                ctx.body = {error: 'Internal server error'};
            }
        }
    }   
}
```

<a name="options_errors_enabled"></a>
**errors.enabled**

Control if error logging is enabled. Defaults to `true`.

*Example*:

```js
{
    errors: {
        enabled: true
    }
}
```

<a name="options_headers_regex"></a>
**headersRegex**

Specify a regular expression to match the request headers,
that should be included in every `inbound_request` log message.
Defaults to `new RegExp('^X-.+', 'i')`.
All the inbound request's headers starting with "X-" will be logged by default.

*Example*:

```js
{
    headersRegex: new RegExp('X-.+', 'i')
}
```

<a name="options_health"></a>
**health**

Specify your health endpoints in order to log a minimum subset of information,
for these `inbound_requests`. Defaults to `[]`.
This may be useful when: You have a load balancer or other system that pings your server at a specific end-point,
periodically, to determine the health of your server, and you do not want to log much details regarding these requests.

*Example*

```js
{
    health: [
        { 
            path: '/health', 
            method: 'GET'
        }
    ] 
}
```

<a name="options_inbound"></a>
**inbound**

Inbound HTTP traffic configuration

<a name="options_inbound_enabled"></a>
**inbound.enabled**

Enable inbound HTTP traffic logs. Defaults to `true`.

*Example*:

```js
{
    inbound: {
        enabled: true
    }
}
```

<a name="options_outbound"></a>
**outbound**

Outbound HTTP traffic configuration

<a name="options_outbound_enabled"></a>
**outbound.enabled**

Enable outbound HTTP traffic logs. Defaults to `true`.

*Example*:

```js
{
    outbound: {
        enabled: true
    }
}
```

<a name="options_trace_header_name"></a>
**traceHeaderName**

Theis is a Header key for the request id header. 
Defaults to: `X-Riviere-Id`.
If you already use a request id header you may need to set this options.
For example for Heroku deployments, 
you most often want to set the `riviere` `traceHeaderName` to: `X-Request-ID`
(https://devcenter.heroku.com/articles/http-request-id)

*Example*:

```js
{
    traceHeaderName: 'X-Request-ID'
}
```

---

<!---
**outbound.info**

Set the log level for outbound HTTP traffic. Defaults to `info`.

**sync**

Control whether logs should be flushed in a sync or async fashion (experimental). Defaults to `true`.

*Example*

```js
{
  headersRegex: /X-.+/ to match all custom HTTP headers.
}
```
-->

<!---
**logger**

Pass the logger object

*Example of the default logger*

```js
{
  info: console.log,
  error: console.error
}
```
-->
<!---
**inbound.info**

Set the log level for inbound HTTP traffic. Defaults to `info`.
-->

<a name="License"></a>
## License

  MIT
