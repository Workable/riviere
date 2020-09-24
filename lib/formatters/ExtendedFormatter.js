const BaseFormatter = require('./BaseFormatter');
const serialize = require('../serializers/toKeyValue');
const chalk = require('chalk');
const flat = require('flat');

class ExtendedFormatter extends BaseFormatter {
  formatObject(obj) {
    if (obj.metaHeaders) {
      obj.metaHeaders = flat(obj.metaHeaders, { safe: true });
    }
    if (obj.metaBody) {
      obj.metaBody = flat(obj.metaBody, { safe: true });
    }
    if (this.color) {
      return this.getPrefix(obj) + ' | ' + chalk.grey(serialize(obj));
    } else {
      return this.getPrefix(obj) + ' | ' + serialize(obj);
    }
  }
}

module.exports = ExtendedFormatter;
