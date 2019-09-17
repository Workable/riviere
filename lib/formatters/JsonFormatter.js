const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  formatObject(obj) {
    const defaultObject = {
      severity: 'info',
      message: 'Test message',
      time: new Date().toISOString()
    };

    const jsonObject = { ...defaultObject, ...obj };

    return JSON.stringify(jsonObject);
  }
}

module.exports = JsonFormatter;
