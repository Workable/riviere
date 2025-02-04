[![NPM](https://nodei.co/npm/@workablehr/riviere.png)](https://nodei.co/npm/@workablehr/riviere)

[![Coverage Status](https://coveralls.io/repos/github/Workable/riviere/badge.svg?branch=master)](https://coveralls.io/github/Workable/riviere?branch=master)

# riviere

The `riviere` module decorates your `Koa` middleware chain with inbound/outbound HTTP traffic logs.

Use `riviere` if you want an easy way to log all the HTTP traffic for your server.
`riviere` works independently of your logging library, if you  use any.

---

# Table of contents
1. [Features](#Features)
2. [Example logs](#Example_logs)
3. [Requirements](#Requirements)
4. [Installation](#Installation)
5. [Usage](#Usage)
6. [Configuration](#Configuration)
7. [Available Options](#Available_options)
    1. [inbound.enabled](#options_inbound_enabled)
    2. [inbound.includeHost](#options_inbound_includeHost)
    3. [inbound.request.enabled](#options_inbound_request_enabled)
    4. [inbound.maxBodyValueChars](#options_inbound_max_body_value_chars)
    5. [bodyKeys](#options_body_keys)
    6. [bodyKeysRegex](#options_body_keys_regex)
    7. [bodyKeysCallback](#options_body_keys_callback)
    8. [color](#options_color)
    9. [styles](#options_styles)
    10. [context](#options_context)
    11. [errors.callback](#options_errors_callback)
    12. [headersRegex](#options_headers_regex)
    13. [headerValueCallback](#options_header_value_callback)
    14. [health](#options_health)
    15. [outbound.enabled](#options_outbound_enabled)
    16. [outbound.request.enabled](#options_outbound_request_enabled)
    17. [outbound.maxBodyValueChars](#options_outbound_max_body_value_chars)
    18. [outbound.blacklistedPathRegex](#options_outbound_blacklisted_path_regex)
    19. [traceHeaderName](#options_trace_header_name)
8. [License](#License)

---

<a name="Features"></a>
## Features

- Log all the HTTP(s) requests that are coming into your server and the corresponding responses.
  (`inbound_request`/`outbound_response`)
- Log all the HTTP(s) requests that your server sends to any external systems and the corresponding responses.
  (`outbound_request`/`inbound_response`)
- Log any unhandled errors that are thrown inside a requests's context.
- Format logs in json (fully compatible with Google Stackdriver)

---

<a name="Example_logs"></a>
## Example logs

![alt text](https://raw.githubusercontent.com/Workable/riviere/images/images/riviere_logs_screen_5.png)

The above example logs are generated by executing:
```js
curl localhost:3000 -H "X-myHeader: myHeaderValue"
```
Assuming that the following example server is running:
![examples/hello_with_outgoing_traffic.js](https://github.com/Workable/riviere/blob/master/examples/hello_with_outgoing_traffic.js)

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
const riviere = require('riviere');

const app = new Koa();

app.use(riviere());
app.use(async function(ctx) {
    ctx.body = 'Hello World';
});

app.listen(3000);
```

<a name="example_with_outbound_http_traffic"></a>
*Example with outbound HTTP traffic*:

```js
const Koa = require('koa');
const riviere = require('riviere');

// this is just an example, you can use any http library
const rp = require('request-promise');

const app = new Koa();

app.use(riviere());
app.use(async function(ctx) {
  await rp({
    uri: 'https://www.google.com',
    // You can include the x-riviere-id header
    // to trace the request's context inside which
    // the external request is made
    // This is optional but recommended for better tracing:
    headers: {
      'x-riviere-id': ctx.request.headers['x-riviere-id'] // notice that this is lowercase
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
as argument to the `riviere()` method call.

You can start using `riviere'` by just calling `app.use(riviere())`.
In this case the `riviere` will use its default configuration.

The default configuration object is the following:

```js
const configuration = {
    context: ctx => {
        return {};
    },
    errors: {
        enabled: true,
        callback: (err, ctx) => {
            throw(err);
        }
    },
    health: [],
    inbound: {
        enabled: true,
        request: {
            enabled: true
        },
        maxBodyValueChars: undefined
    },
    outbound: {
        enabled: true,
        request: {
            enabled: true
        },
        maxBodyValueChars: undefined
    },
    bodyKeys: [],
    bodyKeysRegex: undefined,
    bodyKeysCallback: (body: any, ctx?: KoaContext) => ({}),
    headersRegex: new RegExp('^X-.*', 'i'),
    traceHeaderName: 'X-Riviere-Id',
    styles: ['simple'],
}
```

Here is an example of a more advanced configuration:

```js
const configuration = {
    bodyKeys: [
        'education',
        'work_experience'
    ],
    color: true,
    context: (ctx) => {
        return {
            userId: ctx.request.headers['user-id'],
            accountId: ctx.request.headers['account-id']
        };
    },
    errors: {
        enabled: true,
        callback: (ctx, error) => {
            ctx.status = error.status || 500;

            if (ctx.status < 500) {
                ctx.body = {error: error.message};
            } else {
                ctx.body = {error: 'Internal server error'};
            }
        }
    },
    headersRegex: new RegExp('X-.+', 'i'),
    health: [
        {
            path: '/health',
            method: 'GET'
        }
    ],
    outbound: {
        enabled: true
    },
    traceHeaderName: 'X-Request-Id',
    styles: ['simple', 'json']
};

app.use(riviere(configuration));
```

The supported key-value options, for the configuration object are described below.

---

<a name="Available_options"></a>
### Available options

<a name="options_inbound"></a>
**inbound**

<a name="options_inbound_enabled"></a>
**inbound.enabled**

Enable inbound HTTP traffic logging. Defaults to `true`.

<a name="options_inbound_request_enabled"></a>
**inbound.request.enabled**

Enable inbound_request HTTP traffic logging. Defaults to `true`.

<a name="options_inbound_includeHost"></a>
**inbound.includeHost**

Log full path, including host on inbound requests. Defaults to `false`.

<a name="options_inbound_max_body_value_chars"></a>
**inbound.maxBodyValueChars**

This option can be used to truncate values `JSON` body of the `inbound` `POST` requests to a specified length. Defaults to undefined.
To use this option, the `POST` request's body should be a valid `JSON`.

*Example*:

```js
{
    inbound: {
        maxBodyValueChars: 1024
    }
}
```

<a name="options_body_keys"></a>
**bodyKeys**

This option can be used to log specific values from the `JSON` body of the `inbound` `POST`, `PUT` & `PATCH` requests.
Defaults to empty Array `[]`.
To use this option, the request's body should be a valid `JSON`.
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

<a name="options_body_keys_regex"></a>
**bodyKeysRegex**

This option can be used to log specific values from the `JSON` body of the `inbound` `POST`, `PUT` & `PATCH` requests.
Defaults to undefined.
To use this option, the request's body should be a valid `JSON`.
Most often this mean that you should register the `Koa` `bodyParser` middleware
(https://www.npmjs.com/package/body-parser) (or something equivalent),
before registering the `riviere` middleware.

This option will override `bodyKeys`

*Example*:

```js
{
    bodyKeysRegex: new RegExp('.*');
}
```

<a name="options_body_keys_callback"></a>
**bodyKeysCallback**

This option can be used to let you choose which fields should be logged on `inbound` `POST`, `PUT` & `PATCH` requests.
Defaults to undefined.
To use this option, the request's body should be a valid `JSON`.
Most often this mean that you should register the `Koa` `bodyParser` middleware
(https://www.npmjs.com/package/body-parser) (or something equivalent),
before registering the `riviere` middleware.

This option will override `bodyKeys` and `bodyKeysRegex`

*Example*:

```js
{
    bodyKeysCallback: (body: any, ctx?: KoaContext) => {
        if (!ctx) return body;
        return {
            ...body,
            fields: body.fields.filter(f => !f._obfuscated)
        }
    };
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

<a name="options_styles"></a>
**styles**

This option is used to format log messages with specific styles. Defaults to: `['simple']`
If multiple options are defined one line is exported for every different style.
Available options are:
- 'simple': Prints method, path, status code and timing followed by ' | ' and a string containing key-value pairs of object properties
- 'extended': Same as simple but also contains key-value pairs of all properties (fully compatible with LogEntries)
- 'json': All object properties as a valid JSON object (fully compatible with Google Stackdriver)

*Example*:
```js
{
    styles: ['simple', 'json']
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

<a name="options_errors_enabled"></a>
**errors.enabled**

Enable inbound HTTP traffic logs. Defaults to `true`.

<a name="options_errors_callback"></a>
**errors.callback**

Control how the server handles any unhandled errors inside a request's context.
The default is to re-throw the unhandled error.

*Example*:

```js
{
    errors: {
        callback: (err, ctx) => {
            ctx.status = err.status || 500;

            if (ctx.status < 500) {
                ctx.body = {error: err.message};
            } else {
                ctx.body = {error: 'Internal server error'};
            }
        }
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

<a name="options_header_value_callback"></a>
**headerValueCallback**

This option can be used to let you modify or change part or the whole value of a header. 
This function will be applied to all headers that are passed based on the `headersRegex`. 
This function takes two argument, the `key` (i.e. the header name) and the `value` (i.e. the header value) and returns the new value of the header.
This function is very useful in cases where is mandatory to hide or remove sensitive data that is part of the header value.
Defaults to undefined. In case of undefined then the header value will remain as is.

*Example*:
In this example we hide some sensitive `id_token` value.

```js
{
    headerValueCallback: (key, value) {
        const regex = /id_token=[\w-]+\.[\w-]+\.[\w-]+/i;
        return value.replace(regex, 'id_token=***');
    };
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

<a name="options_outbound"></a>
**outbound**

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

<a name="options_outbound_request_enabled"></a>
**outbound.request.enabled**

Enable outbound_request HTTP traffic logging. Defaults to `true`.

<a name="options_outbound_max_body_value_chars"></a>
**outbound.maxBodyValueChars**

This option can be used to truncate values `JSON` body of the `outbound` `POST` requests to a specified length. Defaults to undefined.
To use this option, the `POST` request's body should be a valid `JSON`.

*Example*:

```js
{
    outbound: {
        maxBodyValueChars: 1024
    }
}
```

<a name="options_outbound_blacklisted_path_regex"></a>
**outbound.blacklistedPathRegex**

This option can be used to prevent specific outbound paths to be logged.
Defaults to [].

*Example*:

```js
{
    outbound: {
        blacklistedPathRegex: /\/health/
    }
}
```

<a name="options_outbound_request_obfuscate_href_if_header_exists"></a>
**outbound.request.obfuscatedHeaders**

This option can be used to prevent specific URL paths from being logged.
Every request that carries a header with a key that matches the values
will obfuscate the URL path when logging. <br>
Defaults to `['X-Riviere-obfuscate']`

*Example*:

```js
{
    outbound: {
        request: {
            obfuscateHrefIfHeaderExists: ['X-Riviere-obfuscate']
        }
    }
}
```

<a name="options_trace_header_name"></a>
**traceHeaderName**

Theis is a Header key for the request id header.
Defaults to: `X-Riviere-Id`.
If you already use a request id header you may need to set this options.
For example for Heroku deployments,
you most often want to set the `riviere` `traceHeaderName` to: `X-Request-Id`
(https://devcenter.heroku.com/articles/http-request-id)

*Example*:

```js
{
    traceHeaderName: 'X-Request-Id'
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
  (![see LICENCE](https://github.com/Workable/riviere/blob/master/LICENCE))
