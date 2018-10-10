const defaultAdapter = require('../../../../lib/adapters/default');

const sinon = require('sinon');
const should = require('should');

const sandbox = sinon.sandbox.create();

const getOpts = require('../../../../fixtures/getOpts');

const uuid = '9b4f5d20-7a31-468a-b0f8-298013cbe940';

describe('#defaultAdapter', () => {
  describe('.onInboundRequest()', () => {
    it('should pass', () => {
      const ctx = {
        request: {
          headers: {
            test_user_id_header: 'test-user-id'
          },
          method: 'get',
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request'
      });
    });

    it('should pass when forceIds is true and request id is not defined', () => {
      const ctx = {
        request: {
          headers: {
            test_user_id_header: 'test-user-id'
          },
          method: 'get',
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {}
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      opts.forceIds = true;
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.containEql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: '/test',
        query: null,
        log_tag: 'inbound_request'
      });
    });

    it('should pass when POST && this.bodyKeys', () => {
      const ctx = {
        request: {
          method: 'POST',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          body: {
            skills: 'ok'
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        metaBody: {
          'body.skills': 'ok'
        },
        log_tag: 'inbound_request'
      });
    });

    it('should pass when POST && this.bodyKeys no picked keys', () => {
      const ctx = {
        request: {
          method: 'POST',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          body: {
            testKeySomethinfElse: 'ok'
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request'
      });
    });

    it('should pass when POST && this.bodyKeys && bodyKeys exist in body', () => {
      const ctx = {
        request: {
          method: 'post',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          body: {
            testKeyA: true
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request'
      });
    });

    it('should handle health', () => {
      const ctx = {
        request: {
          method: 'GET',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          path: '/health',
          body: {
            testKeyA: true
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/health'
      };
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request_health'
      });
    });

    it('should log headers that match the headersRegex', () => {
      const opts = {
        context: () => {
          return {
            test: true,
            bodyKeys: ['testKayA']
          };
        },
        logger: {
          info: sandbox.spy()
        },
        constructor: {
          EVENT: {
            INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
          }
        },
        bodyKeys: ['testKeyA'],
        headersRegex: new RegExp('XX-.*'),
        serialize: msg => msg,
        inbound: {
          level: 'info'
        },
        traceHeaderName: 'x-ap-id',
        sync: true
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
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        test: true,
        bodyKeys: ['testKayA'],
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        metaHeaders: { 'headers.XX-something': true },
        log_tag: 'inbound_request'
      });
    });

    it('should not log headers when headersRegex && no matched headers', () => {
      const opts = {
        context: () => {
          return {
            test: true,
            bodyKeys: ['testKayA']
          };
        },
        headers: {
          'XX-something': true,
          other: true
        },
        constructor: {
          EVENT: {
            INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
          }
        },
        bodyKeys: ['testKeyA'],
        logger: {
          info: sandbox.spy()
        },
        headersRegex: new RegExp('XX-.*'),
        serialize: msg => msg,
        inbound: {
          level: 'info'
        },
        traceHeaderName: 'x-ap-id',
        sync: true
      };
      const ctx = {
        request: {
          method: 'post',
          body: {
            testKeyA: true
          },
          headers: {
            other: true
          },
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        test: true,
        bodyKeys: ['testKayA'],
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request'
      });
    });

    it('should log full path when configured', () => {
      const ctx = {
        request: {
          headers: {
            test_user_id_header: 'test-user-id'
          },
          method: 'get',
          origin: 'http://test.lvh.me:8080',
          req: {
            url: '/test'
          }
        },
        req: {
          headers: {
            'x-ap-id': uuid
          }
        },
        originalUrl: '/test'
      };
      const opts = getOpts(sandbox);
      opts.inbound.includeHost = true;
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'GET',
        path: 'http://test.lvh.me:8080/test',
        query: null,
        requestId: uuid,
        log_tag: 'inbound_request'
      });
    });
  });
});
