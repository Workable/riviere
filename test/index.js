const Loggable = require('./../lib/loggable');
const sinon = require('sinon');
const should = require('should');

const sandbox = sinon.sandbox.create();

const adapter = {
  onInboundRequest: sandbox.spy(),
  onOutboundResponse: sandbox.spy(),
  onError: sandbox.spy()
};

const loggable = new Loggable({ adapter });

describe('#loggable', () => {
  it('should emit INBOUND_REQUEST event', () => {
    loggable.emit(loggable.constructor.EVENT.INBOUND_REQUEST);
    adapter.onInboundRequest.calledOnce.should.equal(true);
  });

  it('should emit INBOUND_REQUEST event', () => {
    loggable.emit(loggable.constructor.EVENT.OUTBOUND_RESPONSE);
    adapter.onOutboundResponse.calledOnce.should.equal(true);
  });

  it('should emit INBOUND_REQUEST event', () => {
    loggable.emit(loggable.constructor.EVENT.UNEXPECTED_ERROR);
    adapter.onError.calledOnce.should.equal(true);
  });
});
