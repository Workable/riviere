const serialize = require('../serializers/toKeyValue');
const formats = require('../formats');
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
        prefix = prefix[colors[inReq.TAG]].bold;
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [outRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms |`;
      if (color) {
        prefix = obj.status < 400 ? prefix[colors[outRes.TAG]].bold : prefix[colors.err].bold;
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [outReq.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.path} |`;
      if (color) {
        prefix = prefix[colors[outReq.TAG]].bold;
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [inRes.TAG]: obj => {
      let prefix = `[${obj.requestId}] ${inRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms |`;
      if (color) {
        prefix = obj.status < 400 ? prefix[colors[inRes.TAG]].bold : prefix[colors.err].bold;
      }
      return `${prefix} ${serialize(obj)}`;
    },

    [inReqH.TAG]: obj => {
      let msg = `${inReqH.MSG} ${obj.method} ${obj.path}`;
      if (color) {
        msg = msg[colors[inReqH.TAG]].bold;
      }
      return msg;
    },

    [outResH.TAG]: obj => {
      let msg = `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`;
      if (color) {
        msg = obj.status < 400 ? msg[colors[outResH.TAG]].bold : msg[colors.err].bold;
      }
      return msg;
    }
  };
};
