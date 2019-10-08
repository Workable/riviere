const BaseFormatter = require('./BaseFormatter');
const serialize = require('../serializers/toKeyValue');
const chalk = require('chalk');

class ExtendedFormatter extends BaseFormatter {
  formatObject(obj) {
    if (this.color) {
      return this.getPrefix(obj) + ' | ' + chalk.grey(serialize(obj));
    } else {
      return this.getPrefix(obj) + ' | ' + serialize(obj);
    }
  }
}

module.exports = ExtendedFormatter;
