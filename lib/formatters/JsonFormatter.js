const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    super(false, appendDate, requestType);
  }

  formatObject(obj) {
    const { method, path, status, protocol, ...remainingProperties } = obj;

    const defaultObject = {
      severity: obj instanceof Error ? 'error' : 'info',
      //message: this.getPrefix(obj),
      //time: new Date().toISOString(),
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        status: status,
        protocol: protocol
      },
      operation: {
        id: obj.requestId
      }
    };

    const jsonObject = { ...defaultObject, ...remainingProperties };

    return JSON.stringify(jsonObject);
  }
}

module.exports = JsonFormatter;
