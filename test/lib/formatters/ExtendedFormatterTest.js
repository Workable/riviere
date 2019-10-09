const ExtendedFormatter = require('../../../lib/formatters/ExtendedFormatter');
const sinon = require('sinon');
const chalk = require('chalk');
const sandbox = sinon.sandbox.create();

describe('Test Extended Formatter', () => {
  describe('default values', () => {
    beforeEach(() => {
      this.extendedFormatter = new ExtendedFormatter();
      this.getPrefix = sandbox.stub(this.extendedFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatOsbject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.extendedFormatter.formatObject(obj);

      payload.should.containEql('Test Prefix |');
    });
  });

  describe('color:true appendTag:true', () => {
    beforeEach(() => {
      this.extendedFormatter = new ExtendedFormatter(true, true);
      this.getPrefix = sandbox.stub(this.extendedFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatOsbject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.extendedFormatter.formatObject(obj);

      payload.should.containEql(chalk.grey('[e] ') + 'Test Prefix |');
    });
  });

  describe('color:false appendTag:true', () => {
    beforeEach(() => {
      this.extendedFormatter = new ExtendedFormatter(false, true);
      this.getPrefix = sandbox.stub(this.extendedFormatter, 'getPrefix').returns('Test Prefix');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('formatOsbject should return base prefix', () => {
      const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
      const payload = this.extendedFormatter.formatObject(obj);

      payload.should.containEql('[e] Test Prefix |');
    });
  });
});
