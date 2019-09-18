const sinon = require('sinon');

const consoleAppender = require('../../../lib/appenders/console');
const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');

const sandbox = sinon.sandbox.create();

describe('console', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers();

    this.formatObject = sandbox.spy(SimpleFormatter.prototype, 'formatObject');
  });

  afterEach(() => {
    sandbox.restore();
    this.clock.restore();
  });

  it('should format and send msg to the stdout', () => {
    const c = consoleAppender({ styles: ['simple'] });
    c({
      log_tag: 'inbound_request'
    });
    this.formatObject.calledOnce.should.equal(true);
  });

  it('should format and send msg to the stdout if log_tag is not defined and data is error', () => {
    const c = consoleAppender({ styles: ['simple'] });
    const data = new Error('test-error');
    data.context = {};
    data.params = {
      log_tag: 'unexpected_error'
    };
    c(data);
    this.formatObject.calledOnce.should.equal(true);
  });

  it('should pass if log_tag is not defined and data is error and data.params.log_tag is not supported', () => {
    const c = consoleAppender({ styles: ['simple'] });
    const data = new Error('test-error');
    data.context = {};
    data.params = {
      log_tag: 'unsupported_tag'
    };
    c(data);

    this.formatObject.calledOnce.should.equal(true);
    this.formatObject.returned('').should.equal(true);
  });

  it('should pass if data.log_data is not defined', () => {
    const c = consoleAppender();
    const data = {};
    c(data);
  });
});
