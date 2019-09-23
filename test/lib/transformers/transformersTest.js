const { mapOutReq } = require('../../../lib/transformers/transformers');

describe('mapOutReq', () => {
  it('should able to get uri', () => {
    const inMsg = {
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        path: 'path',
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
      href: undefined,
      requestId: undefined,
      metaBody: {},
      log_tag: 'outbound_request'
    });
  });

  it('should able to get matching headers', () => {
    const inMsg = {
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        path: 'path',
        query: 'query'
      },
      headers: {
        'x-transaction-id': 'transaction-id',
        aloha: 'asdasdfasdf'
      }
    };
    const result = mapOutReq(inMsg, undefined, {
      headersRegex: new RegExp('^X-.*', 'i')
    });
    result.should.eql({
      method: undefined,
      protocol: 'http',
      host: 'hostname',
      port: undefined,
      path: 'path',
      query: 'query',
      href: undefined,
      requestId: undefined,
      metaBody: {},
      log_tag: 'outbound_request',
      'headers.x-transaction-id': 'transaction-id'
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
        path: 'path',
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
      href: undefined,
      requestId: undefined,
      log_tag: 'outbound_request',
      metaBody: {
        'body.foo': 'bar'
      }
    });
  });

  it('should able to post uri and npot add body parameters if it is not valid json', () => {
    const inMsg = {
      method: 'POST',
      body: 'test not json',
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
      uri: {
        protocol: 'http:',
        hostname: 'hostname',
        path: 'path',
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
      href: undefined,
      requestId: undefined,
      metaBody: {},
      log_tag: 'outbound_request'
    });
  });
});