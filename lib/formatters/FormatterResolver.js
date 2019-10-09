const SimpleFormatter = require('./SimpleFormatter');
const ExtendedFormatter = require('./ExtendedFormatter');
const JsonFormatter = require('./JsonFormatter');
const MissingFormatter = require('./MissingFormatter');

const formatters = {
  simple: SimpleFormatter,
  extended: ExtendedFormatter,
  json: JsonFormatter
};

module.exports = (type = '', color = false, appendTag = false, appendDate = false, requestType = '') => {
  return formatters[type]
    ? new formatters[type](color, appendTag, appendDate, requestType)
    : new MissingFormatter(type);
};
