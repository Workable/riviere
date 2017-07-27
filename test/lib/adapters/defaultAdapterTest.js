const defaultAdapter = require('../../../lib/adapters/defaultAdapter');
const should = require('should');

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
        should(typeof defaultAdapter).equal('object');
    });
    describe('onInboundRequest', () => {
        it('should pass', () => {
            const ctx = {
                request: {
                    method: 'get'
                },
                originalUrl: '/test'
            };
            defaultAdapter.onInboundRequest.call(getThis(), { ctx });
        });
        it('POST && this.bodyKeys', () => {
            const ctx = {
                request: {
                    method: 'post'
                },
                originalUrl: '/test'
            };
            defaultAdapter.onInboundRequest.call(getThis(), { ctx });
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
            defaultAdapter.onInboundRequest.call(getThis(), { ctx });
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
            defaultAdapter.onInboundRequest.call(that, { ctx });
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
            defaultAdapter.onInboundRequest.call(that, { ctx });
        });
    });
    describe('onOutboundResponse', () => {
        it('should pass', () => {
            should(typeof defaultAdapter.onOutboundResponse).equal('function');
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
            defaultAdapter.onInboundRequest.call(getThis(), { ctx });
            defaultAdapter.onOutboundResponse.call(getThis(), { ctx });
        });
    });
    describe('onError', () => {
        it('should pass', () => {
            should(typeof defaultAdapter.onError).equal('function');
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
            defaultAdapter.onInboundRequest.call(getThis(), { ctx });
            defaultAdapter.onError.call(getThis(), { ctx, err });
        });
    });
    describe('requestProxy', () => {
        it('should pass when incomingMessage.url exists', () => {
            const logger = {
                info: () => {

                }
            };
            const serialize = (a) => a;
            const outboundRequestId = 'test';
            const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
            const incomingMessage = {
                method: 'GET',
                port: '8080',
                headers: {
                    test: 'ok'
                },
                url: {
                    protocol: 'http:',
                    pathname: '/some',
                    query: 'some=something',
                    host: 'some-host'
                }
            };
            const http = {
                request: () => {
                    return {
                        on: (event, fn) => {
                            fn({
                                statusCode: 200
                            });
                        }
                    }
                }
            };
            http.request = new Proxy(http.request, requestProxy);
            http.request(incomingMessage);
        });
        it('should pass when incomingMessage.url does not exist', () => {
            const logger = {
                info: () => {

                }
            };
            const serialize = (a) => a;
            const outboundRequestId = 'test';
            const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
            const incomingMessage = {
                method: 'GET',
                port: '8080',
                headers: {
                    test: 'ok'
                },
                protocol: 'https:',
                path: '/some?somequery=query',
                host: 'test-host',
            };
            const http = {
                request: () => {
                    return {
                        on: (event, fn) => {
                            fn({
                                statusCode: 200
                            });
                        }
                    }
                }
            };
            http.request = new Proxy(http.request, requestProxy);
            http.request(incomingMessage);
        });
        it('should pass when requestId does not exist', () => {
            const logger = {
                info: () => {

                }
            };
            const serialize = (a) => a;
            const outboundRequestId = 'test';
            const requestProxy = defaultAdapter.requestProxy({ logger, serialize, outboundRequestId });
            const incomingMessage = {
                method: 'GET',
                port: '8080',
                headers: {
                },
                protocol: 'https:',
                path: '/some?somequery=query',
                host: 'test-host',
            };
            const http = {
                request: () => {
                    return {
                        on: (event, fn) => {
                            fn({
                                statusCode: 200
                            });
                        }
                    }
                }
            };
            http.request = new Proxy(http.request, requestProxy);
            http.request(incomingMessage);
        });
        it('should pass when requestId key is not given', () => {
            const logger = {
                info: () => {

                }
            };
            const serialize = (a) => a;
            const requestProxy = defaultAdapter.requestProxy({ logger, serialize});
            const incomingMessage = {
                method: 'GET',
                port: '8080',
                headers: {
                },
                protocol: 'https:',
                path: '/some?somequery=query',
                host: 'test-host',
            };
            const http = {
                request: () => {
                    return {
                        on: (event, fn) => {
                            fn({
                                statusCode: 200
                            });
                        }
                    }
                }
            };
            http.request = new Proxy(http.request, requestProxy);
            http.request(incomingMessage);
        });
    });
});
