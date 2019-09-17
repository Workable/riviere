const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe('Test Simple Formatter', function() {
  beforeEach(function() {
    this.simpleFormatter = new SimpleFormatter();
    this.getPrefix = sandbox.stub(this.simpleFormatter, 'getPrefix').returns('Test Prefix');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('formatObject should return base prefix', function() {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    const payload = this.simpleFormatter.formatObject(obj);

    payload.should.equal('Test Prefix');
  });
});
