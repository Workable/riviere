const formats = require('../formats');

const outRes = formats.CATEGORY.OUTBOUND_RESPONSE;
const inReq = formats.CATEGORY.INBOUND_REQUEST;
const outReq = formats.CATEGORY.OUTBOUND_REQUEST;
const inRes = formats.CATEGORY.INBOUND_RESPONSE;
const inReqH = formats.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = formats.CATEGORY.OUTBOUND_RESPONSE_HEALTH;

module.exports = {
  [inReq.TAG]: 'yellow',

  [outRes.TAG]: 'green',

  [outReq.TAG]: 'blue',

  [inRes.TAG]: 'magenta',

  [inReqH.TAG]: 'grey',

  [outResH.TAG]: 'grey',

  err: 'red'
};
