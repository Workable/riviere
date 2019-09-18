const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    super(false, appendDate, requestType);
  }

  formatObject(obj) {
    const defaultObject = {
      severity: 'info',
      message: this.getPrefix(obj),
      time: new Date().toISOString()
    };

    const jsonObject = { ...defaultObject, ...obj };

    return JSON.stringify(jsonObject);
  }
}

module.exports = JsonFormatter;
