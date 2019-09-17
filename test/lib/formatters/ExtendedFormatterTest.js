const ExtendedFormatter = require('../../../lib/formatters/ExtendedFormatter');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe('Test Extended Formatter', function() {
  beforeEach(function() {
    this.extendedFormatter = new ExtendedFormatter();
    this.getPrefix = sandbox.stub(this.extendedFormatter, 'getPrefix').returns('Test Prefix');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('formatOsbject should return base prefix', function() {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    const payload = this.extendedFormatter.formatObject(obj);

    payload.should.containEql('Test Prefix |');
  });
});
