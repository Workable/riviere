const defaultAdapter = require('../../../../lib/adapters/default');
const url = require('url');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

describe('#defaultAdapter', () => {
  let clock;
  before(() => {
    clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
  });
  after(() => {
    clock.restore();
  });
  describe('.requestProxy()', () => {
    it('should pass', () => {
      defaultAdapter.requestProxy();
    });

    it('should pass when incomingMessage.url exists', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          test: 'ok'
        },
        protocol: 'http:',
        path: '/some',
        pathname: '/some',
        query: 'some=something',
        hostname: 'some-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      const httpRequest = () => {
        return {
          on: (on, cb) => {
            const res = {};
            cb(res);
            logger.info.callCount.should.equal(2);
            logger.info.args[0][0].should.eql({
              method: 'GET',
              protocol: 'http',
              port: '8080',
              path: '/some',
              query: 'some=something',
              requestId: 'ok',
              href: 'http://some-host:8080/some',
              host: 'some-host',
              metaBody: {},
              metaHeaders: {},
              contentLength: 0,
              log_tag: 'outbound_request'
            });
            logger.info.args[1][0].should.eql({
              method: 'GET',
              path: '/some',
              host: 'some-host',
              duration: 0,
              query: 'some=something',
              href: 'http://some-host:8080/some',
              status: undefined,
              protocol: 'http',
              requestId: 'ok',
              contentLength: 0,
              userAgent: '',
              log_tag: 'inbound_response'
            });
          }
        };
      };
      http.request = new Proxy(httpRequest, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(2);
    });

    it('should pass when no protocol', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          test: 'ok'
        },
        protocol: undefined,
        path: '/some',
        pathname: '/some',
        query: 'some=something',
        host: 'some-host'
      };
      const http = {
        request: function() {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      const httpRequest = function() {
        arguments[0].should.eql({
          method: 'GET',
          port: '8080',
          headers: { test: 'ok' },
          protocol: undefined,
          path: '/some',
          pathname: '/some',
          query: 'some=something',
          host: 'some-host'
        });
        return {
          on: () => {
            throw new Error('should not be called');
          }
        };
      };
      http.request = new Proxy(httpRequest, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(0);
    });

    it('should pass but not log when path is in blacklisted paths', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info',
        opts: {
          blacklistedPathRegex: new RegExp('^/v4.0/traces$')
        }
      });
      const options = {
        method: 'PUT',
        port: '8080',
        headers: {
          test: 'ok'
        },
        protocol: 'https:',
        path: '/v4.0/traces',
        pathname: '/v4.0/traces',
        hostname: 'test-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(0);
    });

    it('should pass when incomingMessage.url does not exist', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          test: 'ok'
        },
        protocol: 'https:',
        path: '/some?somequery=query',
        pathname: '/some?somequery=query',
        hostname: 'test-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(2);
      logger.info.args[0][0].should.eql({
        method: 'GET',
        port: '8080',
        path: '/some?somequery=query',
        query: undefined,
        requestId: 'ok',
        host: 'test-host',
        protocol: 'https',
        href: 'https://test-host:8080/some%3Fsomequery=query',
        metaBody: {},
        metaHeaders: {},
        contentLength: 0,
        log_tag: 'outbound_request'
      });
      logger.info.args[1][0].should.eql({
        method: 'GET',
        path: '/some?somequery=query',
        status: 200,
        host: 'test-host',
        protocol: 'https',
        href: 'https://test-host:8080/some%3Fsomequery=query',
        duration: 0,
        query: undefined,
        requestId: 'ok',
        contentLength: 0,
        userAgent: '',
        log_tag: 'inbound_response'
      });
    });

    it('should pass when requestId is not given', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info',
        opts: { headersRegex: new RegExp('test', 'i') }
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {},
        protocol: 'https:',
        path: '/some?somequery=query',
        pathname: '/some?somequery=query',
        hostname: 'test-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(2);
      logger.info.args[0][0].metaHeaders.headers.should.have.property('test');
      logger.info.args[0][0].should.containEql({
        method: 'GET',
        protocol: 'https',
        host: 'test-host',
        port: '8080',
        path: '/some?somequery=query',
        query: undefined,
        href: 'https://test-host:8080/some%3Fsomequery=query',
        metaBody: {},
        log_tag: 'outbound_request'
      });
      logger.info.args[1][0].should.containEql({
        method: 'GET',
        host: 'test-host',
        path: '/some?somequery=query',
        status: 200,
        duration: 0,
        query: undefined,
        protocol: 'https',
        log_tag: 'inbound_response'
      });
    });

    it('should pass when requestId does not exist', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          [traceHeaderName]: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2'
        },
        protocol: 'https:',
        path: '/some?somequery=query',
        pathname: '/some?somequery=query',
        hostname: 'test-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(2);
      logger.info.args[0][0].should.eql({
        method: 'GET',
        protocol: 'https',
        host: 'test-host',
        port: '8080',
        path: '/some?somequery=query',
        query: undefined,
        href: 'https://test-host:8080/some%3Fsomequery=query',
        requestId: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2',
        metaBody: {},
        metaHeaders: {},
        contentLength: 0,
        log_tag: 'outbound_request'
      });
      logger.info.args[1][0].should.eql({
        method: 'GET',
        host: 'test-host',
        path: '/some?somequery=query',
        status: 200,
        duration: 0,
        query: undefined,
        href: 'https://test-host:8080/some%3Fsomequery=query',
        protocol: 'https',
        requestId: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2',
        contentLength: 0,
        userAgent: '',
        log_tag: 'inbound_response'
      });
    });

    it('should pass when requestId key is given', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        traceHeaderName,
        serialize,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          [traceHeaderName]: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2'
        },
        protocol: 'https:',
        path: '/some?somequery=query',
        pathname: '/some?somequery=query',
        host: 'test-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(2);
      logger.info.args[0][0].should.eql({
        method: 'GET',
        protocol: 'https',
        host: 'test-host',
        port: '8080',
        path: '/some?somequery=query',
        query: undefined,
        href: 'https://test-host/some%3Fsomequery=query',
        requestId: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2',
        metaBody: {},
        metaHeaders: {},
        contentLength: 0,
        log_tag: 'outbound_request'
      });
      logger.info.args[1][0].should.eql({
        method: 'GET',
        path: '/some?somequery=query',
        status: 200,
        duration: 0,
        href: 'https://test-host/some%3Fsomequery=query',
        host: 'test-host',
        query: undefined,
        protocol: 'https',
        requestId: 'cff07fc2-4ef6-42b6-9a74-ba3abf8b31a2',
        contentLength: 0,
        userAgent: '',
        log_tag: 'inbound_response'
      });
    });

    it('should pass if the proxy throws an error before proxying', () => {
      const logger = {
        info: sandbox.spy(),
        error: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName
      });
      const options = null;
      const http = {
        request: () => {
          return {
            on: () => {
              throw new Error('should not throw');
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(0);
    });

    it('should pass if the proxy throws an error after proxying', () => {
      const logger = {
        info: sandbox.spy(),
        error: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const options = {
        method: 'GET',
        port: '8080',
        headers: {
          test: 'ok'
        },
        protocol: 'http:',
        path: '/some',
        pathname: '/some',
        query: 'some=something',
        hostname: 'some-host'
      };
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn(null);
            }
          };
        }
      };
      http.request = new Proxy(http.request, requestProxy);
      http.request(options);
      logger.info.callCount.should.eql(1);
      logger.info.args[0][0].should.eql({
        method: 'GET',
        protocol: 'http',
        host: 'some-host',
        href: 'http://some-host:8080/some',
        port: '8080',
        path: '/some',
        query: 'some=something',
        requestId: 'ok',
        metaBody: {},
        metaHeaders: {},
        contentLength: 0,
        log_tag: 'outbound_request'
      });
    });

    it('should not throw if the request has no headers', () => {
      const logger = {
        info: sandbox.spy()
      };
      const serialize = a => a;
      const traceHeaderName = 'test';
      const requestProxy = defaultAdapter.requestProxy({
        logger,
        serialize,
        traceHeaderName,
        level: 'info'
      });
      const http = {
        request: () => {
          return {
            on: (event, fn) => {
              fn({
                statusCode: 200
              });
            }
          };
        }
      };
      const options = {
        method: 'GET',
        port: '8080',
        protocol: 'http:',
        path: '/some',
        pathname: '/some',
        query: 'some=something',
        host: 'some-host'
      };
      const httpRequest = () => {
        return {
          on: (on, cb) => {
            const res = {};
            cb(res);
            logger.info.callCount.should.equal(2);
            logger.info.args[0][0].should.containEql({
              method: 'GET',
              protocol: 'http',
              port: '8080',
              path: '/some',
              query: 'some=something',
              href: 'http://some-host/some',
              host: 'some-host',
              metaBody: {},
              log_tag: 'outbound_request'
            });
            logger.info.args[1][0].should.containEql({
              method: 'GET',
              path: '/some',
              host: 'some-host',
              duration: 0,
              query: 'some=something',
              status: undefined,
              protocol: 'http',
              log_tag: 'inbound_response'
            });
          }
        };
      };
      http.request = new Proxy(httpRequest, requestProxy);
      http.request(options);
    });
  });
});
