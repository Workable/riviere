const JsonFormatter = require('../../../lib/formatters/JsonFormatter');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

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
    const obj = {
      method: 'GET',
      requestId: 'testRequestId',
      path: 'test-path',
      log_tag: 'inbound_request',
      duration: 50
    };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);

    json.severity.should.equal('info');
    json['logging.googleapis.com/operation'].id.should.equal(obj.requestId);
    json.requestId.should.equal(obj.requestId);
    json.httpRequest.requestUrl.should.equal(obj.path);
    json.httpRequest.latency.should.equal('0.050000s');
  });

  it('formatObject should return 0 duration if not defined', () => {
    const obj = {
      method: 'GET',
      requestId: 'testRequestId',
      path: 'test-path',
      log_tag: 'inbound_request'
    };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);

    json.severity.should.equal('info');
    json['logging.googleapis.com/operation'].id.should.equal(obj.requestId);
    json.requestId.should.equal(obj.requestId);
    json.httpRequest.requestUrl.should.equal(obj.path);
    json.httpRequest.latency.should.equal('0s');
  });

  it('formatObject should should return as top level info metaBodyand and metaHeaders if defined', () => {
    const obj = {
      method: 'GET',
      requestId: 'testRequestId',
      path: 'test-path',
      log_tag: 'inbound_request',
      metaBody: { 'body.attr_id': '1' },
      metaHeaders: { 'headers.x-custom-request': 'aloha' }
    };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);
    json.severity.should.equal('info');
    json['logging.googleapis.com/operation'].id.should.equal(obj.requestId);
    json.requestId.should.equal(obj.requestId);
    json.httpRequest.requestUrl.should.equal(obj.path);
    json['body.attr_id'].should.equal('1');
    json['headers.x-custom-request'].should.equal('aloha');
  });

  it('formatObject should return severity error if obj is typeof Error', () => {
    const obj = new Error('test-error');
    obj.stack = 'Stack trace';
    obj.context = {};
    obj.params = {
      log_tag: 'unexpected_error'
    };
    const payload = this.jsonFormatter.formatObject(obj);

    const json = JSON.parse(payload);

    json.severity.should.equal('error');
    json.message.should.equal('test-error');
    json.stack_trace.should.equal(obj.stack);
  });
});
