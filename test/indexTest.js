const sinon = require('sinon');
const should = require('should');

const sandbox = sinon.sandbox.create();

const MiddlewareFactory = require('./../index');
const adapter = require('./../lib/adapters/default');

describe('middleware', () => {
  beforeEach(() => {
    sandbox.stub(adapter, 'onInboundRequest').callsFake(() => null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should re-throw any errors by default', async function() {
    const logger = { error: sandbox.spy() };

    const middlewrare = MiddlewareFactory.middleware({
      logger: {
        error: logger.error
      }
    });

    const ctx = {};

    const next = () => {
      throw new Error('something bad happened');
    };

    try {
      await middlewrare(ctx, next);
    } catch (err) {}

    logger.error.calledOnce.should.equal(true);
  });

  it('should call the configured errors.callback on unhandled error', async function() {
    const logger = { error: sandbox.spy() };
    const errorsCallback = sandbox.spy();

    const middlewrare = MiddlewareFactory.middleware({
      logger: {
        error: logger.error
      },
      errors: {
        callback: errorsCallback
      }
    });

    const ctx = {
      test: 'ok'
    };

    const next = () => {
      throw new Error('something bad happened');
    };

    try {
      await middlewrare(ctx, next);
    } catch (err) {}

    errorsCallback.calledOnce.should.equal(true);
    errorsCallback.args[0][0].test.should.equal('ok');
    errorsCallback.args[0][1].message.should.equal('something bad happened');
  });
});
