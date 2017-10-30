const sinon = require('sinon');

const consoleAppender = require('../../../lib/appenders/console');

const sandbox = sinon.sandbox.create();

describe('console', () => {
  before(() => {
    this.clock = sinon.useFakeTimers();
  });

  after(() => {
    sandbox.restore();
    this.clock.restore();
  });

  it('should format and send msg to the stdout', () => {
    const c = consoleAppender();
    c({
      log_tag: 'inbound_request'
    });
  });

  it('should format and send msg to the stdout if log_tag is not defined and data is error', () => {
    const c = consoleAppender();
    const data = new Error('test-error');
    data.context = {};
    data.params = {
      log_tag: 'unexpected_error'
    };
    c(data);
  });

  it('should pass if log_tag is not defined and data is error and data.params.log_tag is not supported', () => {
    const c = consoleAppender();
    const data = new Error('test-error');
    data.context = {};
    data.params = {
      log_tag: 'unsupported_tag'
    };
    c(data);
  });

  it('should pass if data.log_data is not defined', () => {
    const c = consoleAppender();
    const data = {};
    c(data);
  });
});
