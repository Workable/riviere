const Loggable = require('./../lib/loggable');
const loggable = new Loggable({
    adapter: {
        onInboundRequest: () => null,
        onOutboundResponse: () => null,
        onError: () => null
    }
});


describe('loggable', () => {
    it('should pass', () => {
        loggable.emit(loggable.constructor.EVENT.INBOUND_REQUEST);
        loggable.emit(loggable.constructor.EVENT.OUTBOUND_RESPONSE);
        loggable.emit(loggable.constructor.EVENT.UNEXPECTED_ERROR);
    });
});
