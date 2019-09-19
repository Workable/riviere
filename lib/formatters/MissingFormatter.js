const BaseFormatter = require('./BaseFormatter');

class MissingFormatter extends BaseFormatter {
  constructor(type = '') {
    super();
    this.type = type;
  }

  formatObject(obj) {
    return 'Unexpected formatter: ' + this.type;
  }
}

module.exports = MissingFormatter;
