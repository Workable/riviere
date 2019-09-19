const JsonFormatter = require('../../../lib/formatters/JsonFormatter');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe('Test Json Formatter', () => {
  before(() => {
    this.clock = sinon.useFakeTimers();
  });

  after(() => {
    this.clock.restore();
  });

  beforeEach(() => {
    this.jsonFormatter = new JsonFormatter();
    this.getPrefix = sandbox.stub(this.jsonFormatter, 'getPrefix').returns('Test Prefix');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('formatObject should return severity info and message base prefix', () => {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);

    json.severity.should.equal('info');
    json.message.should.equal('Test Prefix');
    json.time.should.equal('1970-01-01T00:00:00.000Z');
  });

  it('formatObject should return severity error if obj is typeof Error', () => {
    const obj = new Error('test-error');
    obj.context = {};
    obj.params = {
      log_tag: 'unexpected_error'
    };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);

    json.severity.should.equal('error');
    json.message.should.equal('Test Prefix');
  });
});
