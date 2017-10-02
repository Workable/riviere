// const defaultAdapter = require('../../../lib/adapters/default');
//
// const sinon = require('sinon');
// const should = require('should');
//
// const sandbox = sinon.sandbox.create();
//
// // const getOpts = () => {
// //   return {
// //       logger: {
// //           info: sandbox.spy(),
// //           error: sandbox.spy()
// //       },
// //       inbound: {
// //           level: 'info'
// //       },
// //       sync: true,
// //       context: ctx => {
// //           return {
// //               userId: ctx.request.headers.test_user_id_header,
// //           };
// //       },
// //       bodyKeys: ['skills', 'edu', 'exp', 'loc', 'lastPageFallback'],
// //       errors: {
// //           callback: (ctx, error) => {
// //               ctx.status = error.status || 500;
// //               let message;
// //
// //               if (config.env === 'development') {
// //                   ctx.body = error.stack;
// //                   return;
// //               }
// //
// //               if (ctx.status < 500) {
// //                   message = error.message;
// //               } else {
// //                   message = 'Something’s up. Please try again, or contact support.';
// //               }
// //               ctx.body = { error: message };
// //           }
// //       },
// //       health: [
// //           { path: '/', method: 'GET' },
// //           { path: '/health', method: 'GET' },
// //       ],
// //       outbound: {
// //           level: 'info',
// //           enabled: true
// //       },
// //       traceHeaderName: 'X-Ap-ID'
// //   };
// // };
//
// //
//
