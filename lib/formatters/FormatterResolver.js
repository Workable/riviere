const SimpleFormatter = require('./SimpleFormatter');
const ExtendedFormatter = require('./ExtendedFormatter');
const JsonFormatter = require('./JsonFormatter');
const MissingFormatter = require('./MissingFormatter');

const formatters = {
  simple: SimpleFormatter,
  extended: ExtendedFormatter,
  json: JsonFormatter
};

module.exports = (type = '', color = false, appendDate = false, requestType = '', loggerCallback = null) => {
  return formatters[type]
    ? new formatters[type](color, appendDate, requestType, loggerCallback)
    : new MissingFormatter(type);
};
