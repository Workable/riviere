// todo refactor
// todo add spies/stubs
// todo add arg assertions
// todo rename test case descriptions

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
        loggable.emit(Loggable.EVENT.INBOUND_REQUEST);
        loggable.emit(Loggable.EVENT.OUTBOUND_RESPONSE);
        loggable.emit(Loggable.EVENT.UNEXPECTED_ERROR);
    });
});
