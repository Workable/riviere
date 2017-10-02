const sinon = require('sinon');
const should = require('should');

const defaultAdapter = require('../../../../lib/adapters/default');
const getOpts = require('../../../../fixtures/getOpts');

const sandbox = sinon.sandbox.create();

describe('#defaultAdapter', () => {
  describe('.onError()', () => {
    it('should pass', () => {
      (typeof defaultAdapter.onError).should.equal('function');
    });

    it('should call this.logger.error()', () => {
      const ctx = {
        request: {
          method: 'post',
          headers: {
            test_user_id_header: 'test-user-id'
          },
          req: {
            url: '/test'
          }
        },
        originalUrl: '/test',
        response: {
          status: 200
        }
      };
      const err = new Error('something bad');
      const opts = getOpts(sandbox);
      defaultAdapter.onInboundRequest.call(opts, { ctx });
      opts.logger.info.calledOnce.should.equal(true);
      opts.logger.info.args[0][0].should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null,
        metaHeaders: {},
        log_tag: 'inbound_request'
      });
      defaultAdapter.onError.call(opts, { ctx, err });
      opts.logger.error.calledOnce.should.equal(true);
      opts.logger.error.args[0][0].params.should.eql({
        query: undefined,
        body: undefined,
        log_tag: 'unexpected_error'
      });
      opts.logger.error.args[0][0].context.should.eql({
        userId: 'test-user-id',
        protocol: undefined,
        method: 'POST',
        path: '/test',
        query: null
      });
      opts.logger.error.args[0][0].message.should.equal('something bad');
    });
  });
});
