const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    super(false, appendDate, requestType);
  }

  formatObject(obj) {
    const { method, path, status, protocol, duration, contentLength, userAgent, ...remainingProperties } = obj;

    const defaultObject = {
      severity: obj instanceof Error ? 'error' : 'info',
      timestamp: new Date().toISOString(),
      //message: this.getPrefix(obj),
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        status: status,
        protocol: protocol,
        latency: duration ? duration + 's' : '0s',
        responseSize: contentLength || 0,
        userAgent: userAgent
      },
      'logging.googleapis.com/operation': {
        id: obj.requestId
      }
    };

    const jsonObject = { ...defaultObject, ...remainingProperties };

    return JSON.stringify(jsonObject);
  }
}

module.exports = JsonFormatter;
