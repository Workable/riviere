const logTags = require('../logTags');

const outRes = logTags.CATEGORY.OUTBOUND_RESPONSE;
const inReq = logTags.CATEGORY.INBOUND_REQUEST;
const outReq = logTags.CATEGORY.OUTBOUND_REQUEST;
const inRes = logTags.CATEGORY.INBOUND_RESPONSE;
const inReqH = logTags.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH;
const unexpectedErr = logTags.CATEGORY.UNEXPECTED_ERROR;

module.exports = {
  [inReq.TAG]: 'yellow',

  [outRes.TAG]: 'green',

  [outReq.TAG]: 'cyan',

  [inRes.TAG]: 'magenta',

  [inReqH.TAG]: 'grey',

  [outResH.TAG]: 'grey',

  [unexpectedErr.TAG]: 'red',

  err: 'red'
};
