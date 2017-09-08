const serialize = require('../serializers/toKeyValue');
const formats = require('../formats');

const outRes = formats.CATEGORY.OUTBOUND_RESPONSE;
const inReq = formats.CATEGORY.INBOUND_REQUEST;
const outReq = formats.CATEGORY.OUTBOUND_REQUEST;
const inRes = formats.CATEGORY.INBOUND_RESPONSE;
const inReqH = formats.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = formats.CATEGORY.OUTBOUND_RESPONSE_HEALTH;

module.exports = {
  [inReq.TAG]: obj => `[${obj.requestId}] ${inReq.MSG} ${obj.method} ${obj.path} | ${serialize(obj)}`,

  [outRes.TAG]: obj =>
    `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms | ${serialize(obj)}`,

  [outReq.TAG]: obj => `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.path} | ${serialize(obj)}`,

  [inRes.TAG]: obj =>
    `[${obj.requestId}] ${inRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms | ${serialize(obj)}`,

  [inReqH.TAG]: obj => `${inReqH.MSG} ${obj.method} ${obj.path}`,

  [outResH.TAG]: obj => `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`
};
