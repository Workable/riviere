const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const riviere = require('./../index');
const adapter = require('./../lib/adapters/default');

describe('riviere', () => {
  beforeEach(() => {
    sandbox.stub(adapter, 'onInboundRequest').callsFake(() => null);
    sandbox.stub(adapter, 'onOutboundResponse').callsFake(() => null);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should re-throw any errors by default', async function() {
    const logger = { error: sandbox.spy() };

    const middleware = riviere({
      logger: {
        error: logger.error
      }
    });

    const ctx = {};

    const next = () => {
      throw new Error('something bad happened');
    };

    try {
      await middleware(ctx, next);
    } catch (_) {
      // ignore
    }

    logger.error.calledOnce.should.equal(true);
  });

  it('should call the configured errors.callback on unhandled error', async function() {
    const logger = { error: sandbox.spy() };
    const errorsCallback = sandbox.spy();

    const middleware = riviere({
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
      await middleware(ctx, next);
    } catch (_) {
      // ignore
    }

    errorsCallback.calledOnce.should.equal(true);
    errorsCallback.args[0][0].message.should.equal('something bad happened');
    errorsCallback.args[0][1].test.should.equal('ok');
  });
});
