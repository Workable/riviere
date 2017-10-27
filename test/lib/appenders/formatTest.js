const chalk = require('chalk');
const sinon = require('sinon');

const format = require('../../../lib/appenders/format');
const logTags = require('../../../lib/logTags');
const colors = require('../../../lib/appenders/colors');

describe('appenders/format', () => {
  it('should pass', () => {
    (typeof format).should.equal('function');
  });

  it('should support  all the logTags', () => {
    Object.keys(format()).should.eql([
      'inbound_request',
      'outbound_response',
      'outbound_request',
      'inbound_response',
      'inbound_request_health',
      'outbound_response_health',
      'unexpected_error'
    ]);
  });

  describe('inbound_request', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().inbound_request;
      const msg = fmt({ method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' });
      msg.should.equal('[testRequestId] <-- GET test-path | method="GET", path="test-path", log_tag="inbound_request"');
    });

    it('color: true, date: false', () => {
      const fmt = format(true).inbound_request;
      const msg = fmt({ method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' });
      msg.should.equal(
        `${chalk[colors['inbound_request']](
          '[testRequestId] <-- GET test-path |'
        )} method="GET", path="test-path", log_tag="inbound_request"`
      );
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).inbound_request;
      const msg = fmt({ method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' });
      msg.should.equal(
        '[1970-01-01T00:00:00.000Z] [testRequestId] <-- GET test-path | method="GET", path="test-path", log_tag="inbound_request"'
      );
    });
  });

  describe('outbound_response', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().outbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        duration: 7
      });
      msg.should.equal(
        '[testRequestId] --> GET test-path 200 7ms | method="GET", path="test-path", log_tag="outbound_response", status=200, duration=7'
      );
    });

    it('color: true, date: false', () => {
      const fmt = format(true).outbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        duration: 7
      });
      msg.should.equal(
        `${chalk[colors['outbound_response']](
          '[testRequestId] --> GET test-path 200 7ms |'
        )} method="GET", path="test-path", log_tag="outbound_response", status=200, duration=7`
      );
    });

    it('color: true, date: false status >= 400', () => {
      const fmt = format(true).outbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 400,
        duration: 7
      });
      msg.should.equal(
        `${chalk[colors.err](
          '[testRequestId] --> GET test-path 400 7ms |'
        )} method="GET", path="test-path", log_tag="outbound_response", status=400, duration=7`
      );
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).outbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        duration: 7
      });
      msg.should.equal(
        '[1970-01-01T00:00:00.000Z] [testRequestId] --> GET test-path 200 7ms | method="GET", path="test-path", log_tag="outbound_response", status=200, duration=7'
      );
    });
  });
});
