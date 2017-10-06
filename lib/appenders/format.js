const serialize = require('../serializers/toKeyValue');
const formats = require('../formats');
const chalk = require('chalk');
const colors = require('./colors');

const outRes = formats.CATEGORY.OUTBOUND_RESPONSE;
const inReq = formats.CATEGORY.INBOUND_REQUEST;
const outReq = formats.CATEGORY.OUTBOUND_REQUEST;
const inRes = formats.CATEGORY.INBOUND_RESPONSE;
const inReqH = formats.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = formats.CATEGORY.OUTBOUND_RESPONSE_HEALTH;

module.exports = (color = false) => {
  return {
    [inReq.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${inReq.MSG} ${obj.method} ${obj.path} |`;
      if (color) {
        prefix = chalk[[colors[inReq.TAG]]](prefix);
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [outRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms |`;
      if (color) {
        prefix = obj.status < 400 ? chalk[colors[outRes.TAG]](prefix) : chalk[colors.err](prefix);
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [outReq.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.path} |`;
      if (color) {
        prefix = chalk[colors[outReq.TAG]](prefix);
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [inRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${inRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms |`;
      if (color) {
        prefix = obj.status < 400 ? chalk[colors[inRes.TAG]](prefix) : chalk[colors.err](prefix);
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [inReqH.TAG]: obj => {
      let msg = `${inReqH.MSG} ${obj.method} ${obj.path}`;
      if (color) {
        msg = chalk[colors[inReqH.TAG]](msg);
      }
      return msg;
    },

    [outResH.TAG]: obj => {
      let msg = `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`;
      if (color) {
        msg = obj.status < 400 ? chalk[colors[outResH.TAG]](msg) : chalk[colors.err](msg);
      }
      return msg;
    }
  };
};
