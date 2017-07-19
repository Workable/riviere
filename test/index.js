// todo refactor
// todo add spies/stubs
// todo add arg assertions
// todo rename test case descriptions

const should = require('should');
const defaultAdapter = require('../lib/adapters/defaultAdapter');

const getThis = () => {
    return {
        getLogCtx: () => {
            return {
                test: true,
                bodyKeys: [ 'testKayA']
            };
        },
        constructor: {
            EVENT: {
                INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
            }
        },
        bodyKeys: ['testKeyA'],
        logger: {
            info: msg => null,
            error: err => null
        },
        serialize: msg => msg
    };
};

describe('defaultAdapter', () => {
    it('should pass', () => {
        should(typeof defaultAdapter).equal('function');
    });
    describe('onInboundRequest', () => {
        it('should pass', () => {
            const ctx = {
                request: {
                    method: 'get'
                },
                originalUrl: '/test'
            };
            defaultAdapter().onInboundRequest.call(getThis(), { ctx });
        });
        it('POST && this.bodyKeys', () => {
            const ctx = {
                request: {
                    method: 'post'
                },
                originalUrl: '/test'
            };
            defaultAdapter().onInboundRequest.call(getThis(), { ctx });
        });
        it('POST && this.bodyKeys && bodyKeys exist in body', () => {
            const ctx = {
                request: {
                    method: 'post',
                    body: {
                        testKeyA: true
                    }
                },
                originalUrl: '/test'
            };
            defaultAdapter().onInboundRequest.call(getThis(), { ctx });
        });
        it('headersRegex', () => {
            const that = {
                getLogCtx: () => {
                    return {
                        test: true,
                        bodyKeys: [ 'testKayA']
                    };
                },
                constructor: {
                    EVENT: {
                        INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
                    }
                },
                bodyKeys: ['testKeyA'],
                logger: {
                    info: (msg) => null
                },
                headersRegex: new RegExp('XX-.*'),
                serialize: msg => msg
            };
            const ctx = {
                request: {
                    method: 'post',
                    body: {
                        testKeyA: true
                    },
                    headers: {
                       'XX-something': true,
                        other: true
                    }
                },
                originalUrl: '/test'
            };
            defaultAdapter().onInboundRequest.call(that, { ctx });
        });
        it('headersRegex && no matched headers', () => {
            const that = {
                getLogCtx: () => {
                    return {
                        test: true,
                        bodyKeys: [ 'testKayA']
                    };
                },
                constructor: {
                    EVENT: {
                        INBOUND_REQUEST_EVENT: 'INBOUND_REQUEST_EVENT'
                    }
                },
                bodyKeys: ['testKeyA'],
                logger: {
                    info: (msg) => null
                },
                headersRegex: new RegExp('XX-.*'),
                serialize: msg => msg
            };
            const ctx = {
                request: {
                    method: 'post',
                    body: {
                        testKeyA: true
                    },
                    headers: {
                        other: true
                    }
                },
                originalUrl: '/test'
            };
            defaultAdapter().onInboundRequest.call(that, { ctx });
        });
    });
    describe('onOutboundResponse', () => {
        it('should pass', () => {
           should(typeof defaultAdapter().onOutboundResponse).equal('function');
        });
        it('should call this.logger.info', () => {
            const ctx = {
                request: {
                    method: 'post'
                },
                originalUrl: '/test',
                response: {
                    status: 200
                }
            };
            defaultAdapter().onInboundRequest.call(getThis(), { ctx });
            defaultAdapter().onOutboundResponse.call(getThis(), { ctx });
        });
    });
    describe('onError', () => {
        it('should pass', () => {
            should(typeof defaultAdapter().onError).equal('function');
        });
        it('should call this.logger.error()', () => {
            const ctx = {
                request: {
                    method: 'post'
                },
                originalUrl: '/test',
                response: {
                    status: 200
                }
            };
            const err = new Error('something bad');
            defaultAdapter().onInboundRequest.call(getThis(), { ctx });
            defaultAdapter().onError.call(getThis(), { ctx, err });
        });
    });
});
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
