const defaultAdapter = require('../../../../lib/adapters/default');

const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const getOpts = require('../../../fixtures/getOpts');

const uuid = '9b4f5d20-7a31-468a-b0f8-298013cbe940';

describe('#defaultAdapter', () => {
  describe('.onOutboundResponse()', () => {
    it('should pass', () => {
      (typeof defaultAdapter.onOutboundResponse).should.equal('function');
    });

    it('should call this.logger.info with body options if bodyKeys are set', () => {
      const ctx = {
        state: {},
        request: {
          method: 'POST',
          headers: {
            test_user_id_header: 'test-user-id',
            Location: '/test/foo'
          },
          body: {
            skills: 'node.js'
          },
          req: {
            url: '/test'
          }
        },
        req: {
          url: '/test',
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test',
        response: {
          headers: {},
          status: 200
        }
      };
      const opts = getOpts(sandbox);
      opts.headersRegex = new RegExp('location', 'i');
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      defaultAdapter.onOutboundResponse.call(opts, { ctx });
      opts.logger.info.callCount.should.equal(2);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request',
        userAgent: '',
        metaBody: { 'body.skills': 'node.js' },
        metaHeaders: {
          'headers.Location': '/test/foo'
        }
      });
      opts.logger.info.args[1][0].should.eql({
        status: undefined,
        duration: NaN,
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        headers: {},
        metaBody: {
          'request.body.skills': 'node.js'
        },
        metaHeaders: {
          'request.headers.Location': '/test/foo'
        },
        userAgent: '',
        contentLength: 0,
        log_tag: 'outbound_response'
        //'body.skills': 'node.js'
      });
    });

    it('should call this.logger.info', () => {
      const ctx = {
        state: {},
        request: {
          method: 'post',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          req: {
            url: '/test'
          }
        },
        req: {
          url: '/test',
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test',
        response: {
          headers: {},
          status: 200
        }
      };
      const opts = getOpts(sandbox);
      opts.headersRegex = new RegExp('location', 'i');
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      defaultAdapter.onOutboundResponse.call(opts, { ctx });
      opts.logger.info.callCount.should.equal(2);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        userAgent: '',
        log_tag: 'inbound_request'
      });
      opts.logger.info.args[1][0].should.eql({
        status: undefined,
        duration: NaN,
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        headers: {},
        contentLength: 0,
        userAgent: '',
        log_tag: 'outbound_response'
      });
    });

    it('should log headers', () => {
      const ctx = {
        state: {},
        request: {
          method: 'post',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          req: {
            url: '/test'
          }
        },
        req: {
          url: '/test',
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test',
        response: {
          status: 200,
          headers: {
            Location: '/test/foo',
            'Set-Cookie': 'deadbeef'
          }
        }
      };
      const opts = getOpts(sandbox);
      opts.headersRegex = new RegExp('location', 'i');
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      defaultAdapter.onOutboundResponse.call(opts, { ctx });
      opts.logger.info.callCount.should.equal(2);
      opts.logger.info.args[1][0].should.eql({
        status: undefined,
        duration: NaN,
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        headers: { 'headers.Location': '/test/foo' },
        contentLength: 0,
        userAgent: '',
        log_tag: 'outbound_response'
      });
    });

    it('should handle health endpoint', () => {
      const ctx = {
        state: {},
        request: {
          method: 'GET',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          path: '/health',
          req: {
            url: '/health'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/health',
        response: {
          status: 200
        }
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      defaultAdapter.onOutboundResponse.call(opts, { ctx });
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: '/health',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request_health'
      });
      opts.logger.info.args[1][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: '/health',
        query: null,
        log_tag: 'outbound_response_health',
        status: undefined,
        requestId: uuid,
        duration: NaN
      });
    });
  });
});
