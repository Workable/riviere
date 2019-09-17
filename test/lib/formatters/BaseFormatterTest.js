const assert = require('assert');
const chalk = require('chalk');
const sinon = require('sinon');

const BaseFormatter = require('../../../lib/formatters/BaseFormatter');
const colors = require('../../../lib/appenders/colors');

describe('Test Base Formatter', function() {
  it('should not implement formatObject', function() {
    this.baseFormatter = new BaseFormatter();
    delete this.baseFormatter.formatObject;
    assert.throws(this.baseFormatter.formatObject, /Not implemented/);
  });

  it('should return empty string in getPrefix if request type does not exist', function() {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    this.baseFormatter = new BaseFormatter(false, false, '');
    const prefix = this.baseFormatter.getPrefix(obj);

    prefix.should.equal('');
  });

  it('should return href if exists in passed object', function() {
    const obj = { href: 'test-href', path: 'test-path' };
    this.baseFormatter = new BaseFormatter(false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(obj.href);
  });

  it('should return href computed by object passed', function() {
    const obj = { path: 'test-path', protocol: 'https', host: 'workable.com/' };
    this.baseFormatter = new BaseFormatter(false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(`${obj.protocol}://${obj.host}${obj.path}`);
  });

  it('should return href computed by object passed with query', function() {
    const obj = { query: 'test-query', protocol: 'https', host: 'workable.com/' };
    this.baseFormatter = new BaseFormatter(false, false, '');
    const href = this.baseFormatter.getHrefFromRes(obj);

    href.should.equal(`${obj.protocol}://${obj.host}?${obj.query}`);
  });

  describe('inbound_request', function() {
    before(() => {
      this.clock = sinon.useFakeTimers();
    });

    after(() => {
      this.clock.restore();
    });

    beforeEach(function() {});

    afterEach(function() {});

    it('color: false, date: false, type: inbound_request', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(false, false, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[testRequestId] <-- GET test-path');
    });

    it('color: true, date: false', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(true, false, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`${chalk[colors['inbound_request']]('[testRequestId] <-- GET test-path')}`);
    });

    it('color: false, date: true', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      this.baseFormatter = new BaseFormatter(false, true, 'inbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[1970-01-01T00:00:00.000Z] [testRequestId] <-- GET test-path');
    });
  });

  describe('outbound_request', function() {
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
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[testRequestId] => GET http://www.google.com');
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`${chalk[colors['outbound_request']]('[testRequestId] => GET http://www.google.com')}`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_request',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, true, 'outbound_request');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[1970-01-01T00:00:00.000Z] [testRequestId] => GET http://www.google.com');
    });
  });

  describe('outbound_response', function() {
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
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[testRequestId] --> GET test-path 200 7ms');
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`${chalk[colors['outbound_response']]('[testRequestId] --> GET test-path 200 7ms')}`);
    });

    it('color: true, date: false status >= 400', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 400,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(true, false, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`${chalk[colors.err]('[testRequestId] --> GET test-path 400 7ms')}`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'outbound_response',
        status: 200,
        duration: 7
      };
      this.baseFormatter = new BaseFormatter(false, true, 'outbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[1970-01-01T00:00:00.000Z] [testRequestId] --> GET test-path 200 7ms');
    });
  });

  describe('inbound_response', function() {
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
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[testRequestId] <= GET http://www.google.com 200 7ms');
    });

    it('color: true, date: false', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(
        `${chalk[colors['inbound_response']]('[testRequestId] <= GET http://www.google.com 200 7ms')}`
      );
    });

    it('color: true, date: false status >= 400', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 500,
        duration: 7,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(true, false, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal(`${chalk[colors.err]('[testRequestId] <= GET http://www.google.com 500 7ms')}`);
    });

    it('color: false, date: true', () => {
      const obj = {
        method: 'GET',
        requestId: 'testRequestId',
        path: 'test-path',
        log_tag: 'inbound_response',
        status: 200,
        duration: 7,
        href: 'http://www.google.com'
      };
      this.baseFormatter = new BaseFormatter(false, true, 'inbound_response');
      const prefix = this.baseFormatter.getPrefix(obj);

      prefix.should.equal('[1970-01-01T00:00:00.000Z] [testRequestId] <= GET http://www.google.com 200 7ms');
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
      this.baseFormatter = new BaseFormatter(false, false, 'inbound_request_health');
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
      this.baseFormatter = new BaseFormatter(true, false, 'inbound_request_health');
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
      this.baseFormatter = new BaseFormatter(false, true, 'inbound_request_health');
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
      this.baseFormatter = new BaseFormatter(false, false, 'outbound_response_health');
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
      this.baseFormatter = new BaseFormatter(true, false, 'outbound_response_health');
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
      this.baseFormatter = new BaseFormatter(true, false, 'outbound_response_health');
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
      this.baseFormatter = new BaseFormatter(false, true, 'outbound_response_health');
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
      this.baseFormatter = new BaseFormatter(false, false, 'unexpected_error');
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
      this.baseFormatter = new BaseFormatter(true, false, 'unexpected_error');
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
      this.baseFormatter = new BaseFormatter(false, true, 'unexpected_error');
      const prefix = this.baseFormatter.getPrefix(err);
      prefix.should.startWith(
        '[1970-01-01T00:00:00.000Z] [c151fe5e-c2fa-4e0e-9e38-be14d97b8817] http GET / | Error: something bad happened'
      );
    });
  });
});
