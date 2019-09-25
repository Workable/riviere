const logTags = require('../logTags');

const inReqH = logTags.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH;
const unexpectedErr = logTags.CATEGORY.UNEXPECTED_ERROR;

module.exports = {
  [inReqH.TAG]: 'grey',
  [outResH.TAG]: 'grey',
  [unexpectedErr.TAG]: 'red',
  err: 'red'
};
