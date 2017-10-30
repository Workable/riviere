const serialize = require('../serializers/toKeyValue');
const logTags = require('../logTags');
const chalk = require('chalk');
const colors = require('./colors');

const outRes = logTags.CATEGORY.OUTBOUND_RESPONSE;
const inReq = logTags.CATEGORY.INBOUND_REQUEST;
const outReq = logTags.CATEGORY.OUTBOUND_REQUEST;
const inRes = logTags.CATEGORY.INBOUND_RESPONSE;
const inReqH = logTags.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH;
const unexpectedErr = logTags.CATEGORY.UNEXPECTED_ERROR;

module.exports = (color = false, date = false) => {
  return {
    [inReq.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${inReq.MSG} ${obj.method} ${obj.path} |`;
      if (date) {
        prefix = `[${new Date().toISOString()}] ${prefix}`;
      }
      if (color) {
        prefix = chalk[[colors[inReq.TAG]]](prefix);
      }
      delete obj.requestId;
      return `${prefix} ${serialize(obj)}`;
    },

    [outRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms |`;
      if (date) {
        prefix = `[${new Date().toISOString()}] ${prefix}`;
      }
      if (color) {
        prefix = obj.status < 400 ? chalk[colors[outRes.TAG]](prefix) : chalk[colors.err](prefix);
      }
      delete obj.requestId;
      return `${prefix} ${serialize(obj)}`;
    },

    [outReq.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.href} |`;
      if (date) {
        prefix = `[${new Date().toISOString()}] ${prefix}`;
      }
      if (color) {
        prefix = chalk[colors[outReq.TAG]](prefix);
      }
      delete obj.requestId;
      delete obj.href;
      return `${prefix} ${serialize(obj)}`;
    },

    [inRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${inRes.MSG} ${obj.href} ${obj.status} ${obj.duration}ms |`;
      if (date) {
        prefix = `[${new Date().toISOString()}] ${prefix}`;
      }
      if (color) {
        prefix = obj.status < 400 ? chalk[colors[inRes.TAG]](prefix) : chalk[colors.err](prefix);
      }
      delete obj.requestId;
      delete obj.href;
      return `${prefix} ${serialize(obj)}`;
    },

    [inReqH.TAG]: obj => {
      let msg = `${inReqH.MSG} ${obj.method} ${obj.path}`;
      if (date) {
        msg = `[${new Date().toISOString()}] ${msg}`;
      }
      if (color) {
        msg = chalk[colors[inReqH.TAG]](msg);
      }
      return msg;
    },

    [outResH.TAG]: obj => {
      let msg = `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`;
      if (date) {
        msg = `[${new Date().toISOString()}] ${msg}`;
      }
      if (color) {
        msg = obj.status < 400 ? chalk[colors[outResH.TAG]](msg) : chalk[colors.err](msg);
      }
      return msg;
    },

    [unexpectedErr.TAG]: obj => {
      let prefix = `[${obj.context.requestId}] ${obj.context.protocol} ${obj.context.method} ${obj.context.path} |`;
      if (date) {
        prefix = `[${new Date().toISOString()}] ${prefix}`;
      }
      if (color) {
        prefix = chalk[colors[unexpectedErr.TAG]](prefix);
      }
      return `${prefix} ${obj.stack}`;
    }
  };
};
