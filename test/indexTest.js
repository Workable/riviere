const sinon = require('sinon');
const { Readable, Writable } = require('stream');

const sandbox = sinon.createSandbox();

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

    const ctx = {
      state: {}
    };

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
      test: 'ok',
      state: {}
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

  it('should calculate content length of outbound response length header', async function() {
    const logger = { info: sandbox.spy() };

    const writable = new Writable({ _write() {} });

    const middleware = riviere({
      logger: {
        info: logger.info
      }
    });

    const ctx = {
      state: {},
      response: {
        length: 10
      },
      res: writable
    };
    const next = () => {};
    await middleware(ctx, next);
    await new Promise(r => writable.end(r));
    ctx.state.calculatedContentLength.should.equal(10);
  });

  it('should calculate content length of outbound response body', async function() {
    const logger = { info: sandbox.spy() };

    const readable = new Readable({ read() {} });
    const writable = new Writable({ write() {} });

    const middleware = riviere({
      logger: {
        info: logger.info
      }
    });

    const ctx = {
      state: {},
      response: {},
      body: readable,
      res: writable,
      onerror: () => {}
    };

    const next = () => {};

    await middleware(ctx, next);
    let end = new Promise(r =>
      readable.once('end', () => {
        writable.end();
        r();
      })
    );
    readable.push('This is a test body object');
    readable.push(null);
    await end;
    ctx.state.calculatedContentLength.should.equal(26);
  });
});
