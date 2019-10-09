const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');
const sinon = require('sinon');
const chalk = require('chalk');
const sandbox = sinon.sandbox.create();

describe('Test Simple Formatter', () => {
  describe('Test Simple Formatter appendTag:false', () => {
    beforeEach(() => {
      this.simpleFormatter = new SimpleFormatter();
      this.getPrefix = sandbox.stub(this.simpleFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatObject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.simpleFormatter.formatObject(obj);

      payload.should.equal('Test Prefix');
    });
  });

  describe('Test Simple Formatter appendTag:true', () => {
    beforeEach(() => {
      this.simpleFormatter = new SimpleFormatter(false, true);
      this.getPrefix = sandbox.stub(this.simpleFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatObject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.simpleFormatter.formatObject(obj);

      payload.should.equal('[s] Test Prefix');
    });
  });

  describe('Test Simple Formatter appendTag:true color:true', () => {
    beforeEach(() => {
      this.simpleFormatter = new SimpleFormatter(true, true);
      this.getPrefix = sandbox.stub(this.simpleFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatObject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.simpleFormatter.formatObject(obj);

      payload.should.equal(chalk.grey('[s] ') + 'Test Prefix');
    });
  });
});
