const ExtendedFormatter = require('../../../lib/formatters/ExtendedFormatter');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

describe('Test Extended Formatter', () => {
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

  it('formatObject should return object with flatten header & body keys', () => {
    const obj = {
      method: 'GET',
      requestId: 'testRequestId',
      path: 'test-path',
      log_tag: 'inbound_request',
      metaBody: { body: { fruit: 'banana', items: ['apple', 'orange'] } },
      metaHeaders: { headers: { 'x-custom-header': 'test' } }
    };
    const payload = this.extendedFormatter.formatObject(obj);
    payload.should.containEql('body.fruit="banana"');
    payload.should.containEql('body.items=["apple", "orange"]');
    payload.should.containEql('headers.x-custom-header="test"');
  });
});
