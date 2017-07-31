const { test } = require('ava');

const defaultAdapter = require('../../../lib/adapters/default');

const getThis = () => {
  return {
    getLogCtx: () => {
      return {
        test: true,
        bodyKeys: ['testKayA']
      };
    },
    constructor: {
      EVENT: {
        INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
      }
    },
    bodyKeys: ['testKeyA'],
    logger: {
      info: msg => null,
      error: err => null
    },
    serialize: msg => msg,
    health: [{ method: 'GET', path: '/health' }]
  };
};

test('defaultAdapter should be an object', t => {
  t.true(typeof defaultAdapter === 'object');
  t.pass();
});

test('defaultAdapter.onInboundRequest should pass', t => {
  const ctx = {
    request: {
      method: 'get'
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest POST && this.bodyKeys', t => {
  const ctx = {
    request: {
      method: 'POST',
      body: {
        testKeyA: 'ok'
      }
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest POST && this.bodyKeys no picked keys', t => {
  const ctx = {
    request: {
      method: 'POST',
      body: {
        testKeySomethinfElse: 'ok'
      }
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest POST && this.bodyKeys && bodyKeys exist in body', t => {
  const ctx = {
    request: {
      method: 'post',
      body: {
        testKeyA: true
      }
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest health', t => {
  const ctx = {
    request: {
      method: 'GET',
      path: '/health',
      body: {
        testKeyA: true
      }
    },
    originalUrl: '/health'
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest headersRegex', t => {
  const that = {
    getLogCtx: () => {
      return {
        test: true,
        bodyKeys: ['testKayA']
      };
    },
    constructor: {
      EVENT: {
        INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
      }
    },
    bodyKeys: ['testKeyA'],
    logger: {
      info: msg => null
    },
    headersRegex: new RegExp('XX-.*'),
    serialize: msg => msg
  };
  const ctx = {
    request: {
      method: 'post',
      body: {
        testKeyA: true
      },
      headers: {
        'XX-something': true,
        other: true
      }
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(that, { ctx });
  t.pass();
});

test('defaultAdapter.onInboundRequest headersRegex && no matched headers', t => {
  const that = {
    getLogCtx: () => {
      return {
        test: true,
        bodyKeys: ['testKayA']
      };
    },
    constructor: {
      EVENT: {
        INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
      }
    },
    bodyKeys: ['testKeyA'],
    logger: {
      info: msg => null
    },
    headersRegex: new RegExp('XX-.*'),
    serialize: msg => msg
  };
  const ctx = {
    request: {
      method: 'post',
      body: {
        testKeyA: true
      },
      headers: {
        other: true
      }
    },
    originalUrl: '/test'
  };
  defaultAdapter.onInboundRequest.call(that, { ctx });
  t.pass();
});

test('defaultAdapter.onOutboundResponse should pass', t => {
  t.is(typeof defaultAdapter.onOutboundResponse, 'function');
  t.pass();
});

test('defaultAdapter.onOutboundResponse should call this.logger.info', t => {
  const ctx = {
    request: {
      method: 'post'
    },
    originalUrl: '/test',
    response: {
      status: 200
    }
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  defaultAdapter.onOutboundResponse.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onOutboundResponse health', t => {
  const ctx = {
    request: {
      method: 'GET',
      path: '/health'
    },
    originalUrl: '/health',
    response: {
      status: 200
    }
  };
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  defaultAdapter.onOutboundResponse.call(getThis(), { ctx });
  t.pass();
});

test('defaultAdapter.onError should pass', t => {
  t.is(typeof defaultAdapter.onError, 'function');
  t.pass();
});

test('defaultAdapter.onError should call this.logger.error()', t => {
  const ctx = {
    request: {
      method: 'post'
    },
    originalUrl: '/test',
    response: {
      status: 200
    }
  };
  const err = new Error('something bad');
  defaultAdapter.onInboundRequest.call(getThis(), { ctx });
  defaultAdapter.onError.call(getThis(), { ctx, err });
  t.pass();
});

test('defaultAdapter.requestProxy should default the arg to empty obj', t => {
  defaultAdapter.requestProxy();
  t.pass();
});

test('defaultAdapter.requestProxy should pass when incomingMessage.url exists', t => {
  const logger = {
    info: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {
      test: 'ok'
    },
    url: {
      protocol: 'http:',
      pathname: '/some',
      query: 'some=something',
      host: 'some-host'
    }
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass when no protocol', t => {
  const logger = {
    info: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {
      test: 'ok'
    },
    url: {
      protocol: undefined,
      pathname: '/some',
      query: 'some=something',
      host: 'some-host'
    }
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass when incomingMessage.url does not exist', t => {
  const logger = {
    info: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {
      test: 'ok'
    },
    protocol: 'https:',
    path: '/some?somequery=query',
    host: 'test-host'
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass when requestId does not exist', t => {
  const logger = {
    info: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {},
    protocol: 'https:',
    path: '/some?somequery=query',
    host: 'test-host'
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass when requestId key is not given', t => {
  const logger = {
    info: () => {}
  };
  const serialize = a => a;
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {},
    protocol: 'https:',
    path: '/some?somequery=query',
    host: 'test-host'
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass if the proxy throws an error before proxying', t => {
  const logger = {
    info: () => {},
    error: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = null;
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn({
            statusCode: 200
          });
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});

test('defaultAdapter.requestProxy should pass if the proxy throws an error after proxying', t => {
  const logger = {
    info: () => {},
    error: () => {}
  };
  const serialize = a => a;
  const outboundRequestId = 'test';
  const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
  const incomingMessage = {
    method: 'GET',
    port: '8080',
    headers: {
      test: 'ok'
    },
    url: {
      protocol: 'http:',
      pathname: '/some',
      query: 'some=something',
      host: 'some-host'
    }
  };
  const http = {
    request: () => {
      return {
        on: (event, fn) => {
          fn(null);
        }
      };
    }
  };
  http.request = new Proxy(http.request, requestProxy);
  http.request(incomingMessage);
  t.pass();
});
