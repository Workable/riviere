const JsonFormatter = require('../../../lib/formatters/JsonFormatter');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe('Test Json Formatter', function() {
  before(() => {
    this.clock = sinon.useFakeTimers();
  });

  after(() => {
    this.clock.restore();
  });

  beforeEach(function() {
    this.jsonFormatter = new JsonFormatter();
    this.getPrefix = sandbox.stub(this.jsonFormatter, 'getPrefix').returns('Test Prefix');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('formatObject should return base prefix', function() {
    const obj = { method: 'GET', requestId: 'testRequestId', path: 'test-path', log_tag: 'inbound_request' };
    const payload = this.jsonFormatter.formatObject(obj);

    payload.should.not.containEql('Test Prefix');

    const json = JSON.parse(payload);

    json.severity.should.equal('info');
    json.time.should.equal('1970-01-01T00:00:00.000Z');
  });
});
