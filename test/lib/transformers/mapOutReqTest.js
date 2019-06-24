const mapOutReq = require('../../../lib/transformers/mapOutReq');

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
      log_tag: 'outbound_request',
      'headers.x-transaction-id': 'transaction-id'
    });
  });
});
