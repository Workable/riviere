const chalk = require('chalk');
const sinon = require('sinon');

const format = require('../../../lib/appenders/format');
const logTags = require('../../../lib/logTags');
const colors = require('../../../lib/appenders/colors');

describe('appenders/format', () => {
  it('should pass', () => {
    (typeof format).should.equal('function');
  });

  it('should support all the logTags', () => {
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

  describe('outbound_request', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().outbound_request;
      const msg = fmt({
        protocol: 'http',
        host: 'www.google.com',
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        href: 'http://www.google.com'
      });
      msg.should.equal(
        '[testRequestId] => GET http://www.google.com | protocol="http", host="www.google.com", method="GET", path="test-path", log_tag="outbound_request"'
      );
    });

    it('color: true, date: false', () => {
      const fmt = format(true).outbound_request;
      const msg = fmt({
        protocol: 'http',
        host: 'www.google.com',
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        href: 'http://www.google.com'
      });
      msg.should.equal(
        `${chalk[colors['outbound_request']](
          '[testRequestId] => GET http://www.google.com |'
        )} protocol="http", host="www.google.com", method="GET", path="test-path", log_tag="outbound_request"`
      );
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).outbound_request;
      const msg = fmt({
        protocol: 'http',
        host: 'www.google.com',
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        href: 'http://www.google.com'
      });
      msg.should.equal(
        '[1970-01-01T00:00:00.000Z] [testRequestId] => GET http://www.google.com | protocol="http", host="www.google.com", method="GET", path="test-path", log_tag="outbound_request"'
      );
    });
  });

  describe('inbound_response', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().inbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      });
      msg.should.equal(
        '[testRequestId] <= GET http://www.google.com 200 7ms | method="GET", path="test-path", log_tag="inbound_response", status=200, duration=7'
      );
    });

    it('color: true, date: false', () => {
      const fmt = format(true).inbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      });
      msg.should.equal(
        `${chalk[colors['inbound_response']](
          '[testRequestId] <= GET http://www.google.com 200 7ms |'
        )} method="GET", path="test-path", log_tag="inbound_response", status=200, duration=7`
      );
    });

    it('color: true, date: false status >= 400', () => {
      const fmt = format(true).inbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 500,
        duration: 7,
        href: 'http://www.google.com'
      });
      msg.should.equal(
        `${chalk[colors.err](
          '[testRequestId] <= GET http://www.google.com 500 7ms |'
        )} method="GET", path="test-path", log_tag="inbound_response", status=500, duration=7`
      );
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).inbound_response;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 500,
        duration: 7,
        href: 'http://www.google.com'
      });
      msg.should.equal(
        '[1970-01-01T00:00:00.000Z] [testRequestId] <= GET http://www.google.com 500 7ms | method="GET", path="test-path", log_tag="inbound_response", status=500, duration=7'
      );
    });
  });

  describe('inbound_request_health', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().inbound_request_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      });
      msg.should.equal('<- GET test-path');
    });

    it('color: true, date: false', () => {
      const fmt = format(true).inbound_request_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      });
      msg.should.equal(`${chalk[colors['inbound_request_health']]('<- GET test-path')}`);
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).inbound_request_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      });
      msg.should.equal('[1970-01-01T00:00:00.000Z] <- GET test-path');
    });
  });

  describe('outbound_response_health', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false', () => {
      const fmt = format().outbound_response_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      });
      msg.should.equal('-> GET test-path 200 7ms');
    });

    it('color: true, date: false', () => {
      const fmt = format(true).outbound_response_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      });
      msg.should.equal(`${chalk[colors['outbound_response_health']]('-> GET test-path 200 7ms')}`);
    });

    it('color: true, date: false status >= 400', () => {
      const fmt = format(true).outbound_response_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 400,
        duration: 7
      });
      msg.should.equal(`${chalk[colors.err]('-> GET test-path 400 7ms')}`);
    });

    it('color: false, date: true', () => {
      const fmt = format(false, true).outbound_response_health;
      const msg = fmt({
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      });
      msg.should.equal('[1970-01-01T00:00:00.000Z] -> GET test-path 200 7ms');
    });
  });

  describe('unexpected_error', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('should return error and context', () => {
      const fmt = format(false, false).unexpected_error;
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      const msg = fmt(err);
      msg.should.startWith('[c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / | Error: something bad happened');
    });

    it('should return error and context (color: true)', () => {
      const fmt = format(true, false).unexpected_error;
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      const msg = fmt(err);
      msg.should.startWith(chalk[colors.err]('[c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / |'));
    });

    it('should return date, error and context ', () => {
      const fmt = format(false, true).unexpected_error;
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      const msg = fmt(err);
      msg.should.startWith(
        '[1970-01-01T00:00:00.000Z] [c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / | Error: something bad happened'
      );
    });
  });
});
