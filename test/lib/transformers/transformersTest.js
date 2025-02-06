const { mapOutReq, mapInRes } = require('../../../lib/transformers/transformers');

describe('mapOutReq', () => {
  it('should able to get uri', () => {
    const inMsg = {
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };
    const result = mapOutReq(inMsg);
    result.should.eql({
      method: undefined,
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      metaBody: {},
      metaHeaders: {},
      contentLength: 0,
      log_tag: 'outbound_request'
    });
  });

  it('should able to get matching headers', () => {
    const inMsg = {
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      },
      headers: {
        'x-transaction-id': 'transaction-id',
        aloha: 'asdasdfasdf'
      }
    };
    const result = mapOutReq(inMsg, undefined, {
      headersRegex: new RegExp('^X-.*', 'i'),
      hostFieldName: 'test_host'
    });
    result.should.eql({
      method: undefined,
      protocol: 'http',
      test_host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      metaBody: {},
      metaHeaders: {
        headers: { 'x-transaction-id': 'transaction-id' }
      },
      contentLength: 0,
      log_tag: 'outbound_request'
    });
  });

  it('should able to post uri and get body parameters', () => {
    const inMsg = {
      method: 'POST',
      body: '{ "foo": "bar" }',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };

    const options = {
      bodyKeys: ['foo']
    };

    const result = mapOutReq(inMsg, undefined, options);
    result.should.eql({
      method: 'POST',
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      contentLength: 0,
      log_tag: 'outbound_request',
      metaHeaders: {},
      metaBody: {
        body: { foo: 'bar' }
      }
    });
  });

  it('should able to post uri and get body parameters with bodyKeysRegex', () => {
    const inMsg = {
      method: 'POST',
      body: '{ "bananas": "bar", "banana1": "apple1", "banana2": "apple2" }',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };

    const options = {
      bodyKeysRegex: new RegExp('^banana\\d+', 'i')
    };

    const result = mapOutReq(inMsg, undefined, options);
    result.should.eql({
      method: 'POST',
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      contentLength: 0,
      log_tag: 'outbound_request',
      metaHeaders: {},
      metaBody: {
        body: {
          banana1: 'apple1',
          banana2: 'apple2'
        }
      }
    });
  });

  it('should able to post uri and get body parameters with bodyKeysCallback', () => {
    const inMsg = {
      method: 'POST',
      body: JSON.stringify({
        fields: [
          { id: 1, label: 'Greeting', value: 'Hello' },
          { id: 2, label: 'Password', value: '***', _obfuscated: true }
        ]
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };

    const options = {
      bodyKeysCallback: (body, ctx) => {
        return {
          ...body,
          fields: body.fields.map(f => {
            if (f._obfuscated) return { ...f, value: '***' };
            return f;
          })
        };
      }
    };

    const result = mapOutReq(inMsg, undefined, options);
    result.should.eql({
      method: 'POST',
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      contentLength: 0,
      log_tag: 'outbound_request',
      metaHeaders: {},
      metaBody: {
        body: {
          fields: [
            { id: 1, label: 'Greeting', value: 'Hello' },
            { id: 2, label: 'Password', value: '***', _obfuscated: true }
          ]
        }
      }
    });
  });

  it('should able to post uri and get truncated body parameters with maxBodyValueChars', () => {
    const inMsg = {
      method: 'POST',
      body: '{ "banana1": "a very very very very very very very very long text", "banana2": "apple2" }',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };

    const options = {
      bodyKeysRegex: new RegExp('^banana\\d+', 'i'),
      maxBodyValueChars: 10
    };

    const result = mapOutReq(inMsg, undefined, options);
    result.should.eql({
      method: 'POST',
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      contentLength: 0,
      log_tag: 'outbound_request',
      metaHeaders: {},
      metaBody: {
        body: {
          banana1: 'a very ver[Trimmed by riviere]',
          banana2: 'apple2'
        }
      }
    });
  });

  it('should able to post uri and not add body parameters if it is not valid json', () => {
    const inMsg = {
      method: 'POST',
      body: 'test not json',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        pathname: 'path',
        query: 'query'
      }
    };

    const options = {
      bodyKeys: ['foo']
    };

    const result = mapOutReq(inMsg, undefined, options);
    result.should.eql({
      method: 'POST',
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: 'http://hostname/path',
      requestId: undefined,
      metaBody: {},
      metaHeaders: {},
      contentLength: 0,
      log_tag: 'outbound_request'
    });
  });
});

describe('mapInRes', () => {
  it('should obfuscate href if the request contained the header from obfuscateHrefIfHeaderExists', () => {
    const startedAt = new Date().getTime();
    const res = {
      statusCode: 200,
      headers: {
        'Content-Length': 100,
        'User-Agent': 'test-agent'
      }
    };

    const req = {
      href: 'http://hostname/path?query=query',
      metaHeaders: {
        headers: {
          'X-Riviere-obfuscate': true
        }
      },
      method: null,
      protocol: 'http',
      host: 'hostname',
      path: '/path',
      query: '?query=query'
    };

    const result = mapInRes(res, req, startedAt, undefined, {
      obfuscateHrefIfHeaderExists: 'X-Riviere-obfuscate'
    });

    result.href.should.eql('http://hostname/***');
  });
});
