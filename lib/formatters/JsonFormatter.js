const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    super(false, appendDate, requestType);
  }

  formatObject(obj) {
    const { method, path, status, protocol, duration, ...remainingProperties } = obj;

    const defaultObject = {
      severity: obj instanceof Error ? 'error' : 'info',
      //message: this.getPrefix(obj),
      //time: new Date().toISOString(),
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        status: status,
        protocol: 'HTTP/1.1',
        latency: duration ? duration + 's' : '0s'
      },
      operation: {
        id: obj.requestId
      },
      jsonPayload: { ...remainingProperties }
    };

    //const jsonObject = { ...defaultObject, ...remainingProperties };

    return JSON.stringify(defaultObject);
  }
}

module.exports = JsonFormatter;
