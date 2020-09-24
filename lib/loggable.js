const EventEmitter = require('events');

const EVENT = {
  INBOUND_REQUEST: 'inbound_request',
  OUTBOUND_RESPONSE: 'outbound_response',
  UNEXPECTED_ERROR: 'unexpected_error'
};

class Loggable extends EventEmitter {
  constructor(options) {
    const {
      adapter,
      logger,
      bodyKeys,
      bodyKeysRegex,
      context,
      headersRegex,
      health,
      inbound,
      sync,
      traceHeaderName,
      forceIds
    } = options;

    super();
    this.adapter = adapter;
    this.logger = logger;
    this.context = context;
    this.bodyKeys = bodyKeys;
    this.bodyKeysRegex = bodyKeysRegex;
    this.headersRegex = headersRegex;
    this.health = health;
    this.inbound = inbound;
    this.sync = sync;
    this.traceHeaderName = traceHeaderName;
    this.forceIds = forceIds;

    this.on(EVENT.INBOUND_REQUEST, (...args) => this.adapter.onInboundRequest.call(this, ...args));
    this.on(EVENT.OUTBOUND_RESPONSE, (...args) => this.adapter.onOutboundResponse.call(this, ...args));
    this.on(EVENT.UNEXPECTED_ERROR, (...args) => this.adapter.onError.call(this, ...args));
  }
}

Loggable.EVENT = EVENT;

module.exports = Loggable;
