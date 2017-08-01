const EventEmitter = require('events');

const flat = require('flat');

const EVENT = {
  INBOUND_REQUEST: 'inbound_request',
  OUTBOUND_RESPONSE: 'outbound_response',
  UNEXPECTED_ERROR: 'unexpected_error'
};

class Loggable extends EventEmitter {
  constructor({ adapter, logger, bodyKeys, getLogCtx, headersRegex, health, inbound }) {
    super();
    this.adapter = adapter;
    this.logger = logger;
    this.getLogCtx = getLogCtx;
    this.bodyKeys = bodyKeys;
    this.headersRegex = headersRegex;
    this.health = health;
    this.inbound = inbound;

    this.on(EVENT.INBOUND_REQUEST, (...args) => this.adapter.onInboundRequest.call(this, ...args));
    this.on(EVENT.OUTBOUND_RESPONSE, (...args) => this.adapter.onOutboundResponse.call(this, ...args));
    this.on(EVENT.UNEXPECTED_ERROR, (...args) => this.adapter.onError.call(this, ...args));
  }
}

Loggable.EVENT = EVENT;

module.exports = Loggable;
