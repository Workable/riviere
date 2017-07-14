const lodash = require('lodash');
const EventEmitter = require('events');
const serializeTokeyValue = require('./serialzeToKeyValue');

const flat = require('flat');

const EVENT = {
  INBOUND_REQUEST: 'inbound_request',
  OUTBOUND_RESPONSE: 'outbound_response',
  UNEXPECTED_ERROR: 'unexpected_error'
};

class Loggable extends EventEmitter {
  constructor({ adapter, logger, bodyKeys, getLogCtx, headersRegex, serialize = serializeTokeyValue }) {
    super();
    this.adapter = adapter;
    this.logger = logger;
    this.getLogCtx = getLogCtx;
    this.bodyKeys = bodyKeys;
    this.headersRegex = headersRegex;
    this.serialize = serialize;

    this.on(EVENT.INBOUND_REQUEST, (...args) => this.adapter.onIncomingRequest.call(this, ...args));
    this.on(EVENT.OUTBOUND_RESPONSE, (...args) => this.adapter.onOutcomingResponse.call(this, ...args));
    this.on(EVENT.UNEXPECTED_ERROR, (...args) => this.adapter.onError.call(this, ...args));
  }
}

Loggable.EVENT = EVENT;

module.exports = Loggable;
