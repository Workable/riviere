const serialize = require('../serializers/toKeyValue');
const constants = require('constants');

const outRes = constants.CATEGORY.OUTBOUND_RESPONSE;
const inReq = constants.CATEGORY.INBOUND_REQUEST;
const outReq = constants.CATEGORY.OUTBOUND_REQUEST;
const inRes = constants.CATEGORY.INBOUND_RESPONSE;
const inReqH = constants.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = constants.CATEGORY.OUTBOUND_RESPONSE_HEALTH;

module.exports = {
    [inReq.TAG]: obj =>
        `[${obj.requestId}] ${inReq.MSG} ${obj.method} ${obj.path} | ${serialize(obj)}`,

    [outRes.TAG]: obj =>
        `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms | ${serialize(obj)}`,

    [outReq.TAG]: obj =>
        `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.path} | ${serialize(obj)}`,

    [inRes.TAG]: obj =>
        `[${obj.requestId}] ${inRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms | ${serialize(obj)}`,

    [inReqH.TAG]: obj =>
        `${inReqH.MSG} ${obj.method} ${obj.path}`,

    [outResH.TAG]: obj =>
        `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`
};
