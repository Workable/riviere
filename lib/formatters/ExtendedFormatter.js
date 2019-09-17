const BaseFormatter = require('./BaseFormatter');
const serialize = require('../serializers/toKeyValue');

class ExtendedFormatter extends BaseFormatter {
  formatObject(obj) {
    return this.getPrefix(obj) + ' | ' + `${serialize(obj)}`;
  }
}

module.exports = ExtendedFormatter;
