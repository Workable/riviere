const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

describe('Test Simple Formatter', () => {
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

  it('formatObject should return object with flatten header & body keys', () => {
    const obj = {
      method: 'GET',
      requestId: 'testRequestId',
      path: 'test-path',
      log_tag: 'inbound_request',
      metaBody: { body: { fruit: 'banana', items: ['apple', 'orange'] } },
      metaHeaders: { headers: { 'x-custom-header': 'test' } }
    };
    const payload = this.simpleFormatter.formatObject(obj);
    payload.should.containEql('body.fruit="banana"');
    payload.should.containEql('body.items=["apple", "orange"]');
    payload.should.containEql('headers.x-custom-header="test"');
  });
});
