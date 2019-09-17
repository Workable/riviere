const BaseFormatter = require('./BaseFormatter');

class SimpleFormatter extends BaseFormatter {
  formatObject(obj) {
    return this.getPrefix(obj);
  }
}

module.exports = SimpleFormatter;
