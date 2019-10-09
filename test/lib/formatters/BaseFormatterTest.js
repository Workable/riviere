const assert = require('assert');
const chalk = require('chalk');
const sinon = require('sinon');

const BaseFormatter = require('../../../lib/formatters/BaseFormatter');
const colors = require('../../../lib/appenders/colors');

describe('Test Base Formatter', () => {
  it('should not implement formatObject', () => {
    this.baseFormatter = new BaseFormatter();
    delete this.baseFormatter.formatObject;
    assert.throws(this.baseFormatter.formatObject, /Not implemented/);
  });

  it('should return empty string in getPrefix if request type does not exist', () => {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const prefix = this.baseFormatter.getPrefix(obj);

    prefix.should.equal('');
  });

  it('should return href if exists in passed object', () => {
    const obj = { href: 'test-href', path: 'test-path' };
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(obj.href);
  });

  it('should return href computed by object passed', () => {
    const obj = { path: 'test-path', protocol: 'https', host: 'workable.com/' };
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(`${obj.protocol}://${obj.host}${obj.path}`);
  });

  it('should return href computed by object passed with query', () => {
    const obj = { query: 'test-query', protocol: 'https', host: 'workable.com/' };
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(`${obj.protocol}://${obj.host}?${obj.query}`);
  });

  it('should return specific color if valid status is passed', () => {
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const color = this.baseFormatter.getColorByStatus(100);

    color.should.equal('green');
  });

  it('should return yellow if invalid status is passed', () => {
    this.baseFormatter = new BaseFormatter(false, false, false, '');
    const color = this.baseFormatter.getColorByStatus(800);

    color.should.equal('yellow');
  });

  describe('inbound_request', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    beforeEach(() => {});

    afterEach(() => {});

    it('color: false, date: false, type: inbound_request', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(false, false, false, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`[testRequestId] <-- GET test-path`);
    });

    it('color: true, date: false', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(true, false, false, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      prefix.should.equal(`${requestInfo} <-- ${method} test-path`);
    });

    it('color: false, date: true', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(false, false, true, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[1970-01-01T00:00:00.000Z] [testRequestId] <-- GET test-path');
    });
  });

  describe('outbound_request', () => {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    it('color: false, date: false, type: outbound_request', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`[${obj.requestId}] => ${obj.method} http://www.google.com ${obj.contentLength}b`);
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      prefix.should.equal(`${requestInfo} => ${method} http://www.google.com ${obj.contentLength}b`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(
        `[1970-01-01T00:00:00.000Z] [testRequestId] => GET http://www.google.com ${obj.contentLength}b`
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

    it('color: false, date: false, type: outbound_response', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        contentLength: 5,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`[${obj.requestId}] --> ${obj.method} test-path 200 7ms ${obj.contentLength}b`);
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        contentLength: 5,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      const status = chalk[this.baseFormatter.getColorByStatus(obj.status)](obj.status);
      prefix.should.equal(`${requestInfo} --> ${method} test-path ${status} 7ms ${obj.contentLength}b`);
    });

    it('color: true, date: false status >= 400', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 400,
        contentLength: 5,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      const status = chalk[this.baseFormatter.getColorByStatus(obj.status)](obj.status);
      prefix.should.equal(`${requestInfo} --> ${method} test-path ${status} 7ms ${obj.contentLength}b`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        contentLength: 5,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(
        `[1970-01-01T00:00:00.000Z] [${obj.requestId}] --> ${obj.method} test-path 200 7ms ${obj.contentLength}b`
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

    it('color: false, date: false, type: inbound_response', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`[${obj.requestId}] <= ${obj.method} http://www.google.com 200 7ms ${obj.contentLength}b`);
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      const status = chalk[this.baseFormatter.getColorByStatus(obj.status)](obj.status);
      prefix.should.equal(`${requestInfo} <= ${method} http://www.google.com ${status} 7ms ${obj.contentLength}b`);
    });

    it('color: true, date: false status >= 400', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 500,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      const method = chalk.bold('GET');
      const requestInfo = chalk.grey('[testRequestId]');
      const status = chalk[this.baseFormatter.getColorByStatus(obj.status)](obj.status);
      prefix.should.equal(`${requestInfo} <= ${method} http://www.google.com ${status} 7ms ${obj.contentLength}b`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        contentLength: 5,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(
        `[1970-01-01T00:00:00.000Z] [${obj.requestId}] <= ${obj.method} http://www.google.com 200 7ms ${
          obj.contentLength
        }b`
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
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'inbound_request_health');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('<- GET test-path');
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'inbound_request_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal(`${chalk[colors['inbound_request_health']]('<- GET test-path')}`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_request_health'
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'inbound_request_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal('[1970-01-01T00:00:00.000Z] <- GET test-path');
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
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'outbound_response_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal('-> GET test-path 200 7ms');
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'outbound_response_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal(`${chalk[colors['outbound_response_health']]('-> GET test-path 200 7ms')}`);
    });

    it('color: true, date: false status >= 400', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 400,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'outbound_response_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal(`${chalk[colors.err]('-> GET test-path 400 7ms')}`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response_health',
        status: 200,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'outbound_response_health');
      const prefix = this.baseFormatter.getPrefix(obj);
      prefix.should.equal('[1970-01-01T00:00:00.000Z] -> GET test-path 200 7ms');
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
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      this.baseFormatter = new BaseFormatter(false, false, false, 'unexpected_error');
      const prefix = this.baseFormatter.getPrefix(err);
      prefix.should.startWith('[c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / | Error: something bad happened');
    });

    it('should return error and context (color: true)', () => {
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      this.baseFormatter = new BaseFormatter(true, false, false, 'unexpected_error');
      const prefix = this.baseFormatter.getPrefix(err);
      prefix.should.startWith(chalk[colors.err]('[c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / |'));
    });

    it('should return date, error and context ', () => {
      const err = new Error('something bad happened');
      err.context = {
        requestId: 'c151fe5e-c2fa-4e0e-9e38-be14d97b8817',
        method: 'GET',
        protocol: 'http',
        path: '/',
        query: null
      };
      this.baseFormatter = new BaseFormatter(false, false, true, 'unexpected_error');
      const prefix = this.baseFormatter.getPrefix(err);
      prefix.should.startWith(
        '[1970-01-01T00:00:00.000Z] [c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / | Error: something bad happened'
      );
    });
  });
});
