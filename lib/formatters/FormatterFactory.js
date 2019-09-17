const SimpleFormatter = require('./SimpleFormatter');
const ExtendedFormatter = require('./ExtendedFormatter');
const JsonFormatter = require('./JsonFormatter');

const create = (type = '', color = false, appendDate = false, requestType = '') => {
  switch (type) {
    case 'simple': {
      return new SimpleFormatter(color, appendDate, requestType);
    }
    case 'extended': {
      return new ExtendedFormatter(color, appendDate, requestType);
    }
    case 'json': {
      return new JsonFormatter(color, appendDate, requestType);
    }
    default:
      return null;
  }
};

module.exports = create;
