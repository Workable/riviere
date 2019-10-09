const BaseFormatter = require('./BaseFormatter');
const serialize = require('../serializers/toKeyValue');
const chalk = require('chalk');

class ExtendedFormatter extends BaseFormatter {
  formatObject(obj) {
    const tag = this.appendTag ? '[e] ' : '';

    if (this.color) {
      return chalk.grey(tag) + this.getPrefix(obj) + ' | ' + chalk.grey(serialize(obj));
    } else {
      return tag + this.getPrefix(obj) + ' | ' + serialize(obj);
    }
  }
}

module.exports = ExtendedFormatter;
