const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    super(false, appendDate, requestType);
  }

  formatObject(obj) {
    let jsonObject = obj instanceof Error ? this.formatErrorObject(obj) : this.formatValidObject(obj);

    return JSON.stringify(jsonObject);
  }

  formatErrorObject(obj) {
    return {
      severity: 'error',
      timestamp: new Date().toISOString(),
      '@type': 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
      message: obj.message,
      stack_trace: obj.stack,
      context: {
        httpRequest: {
          method: obj.context.method,
          url: obj.context.path,
          protocol: obj.context.protocol
        }
      },
      'logging.googleapis.com/operation': {
        id: obj.context.requestId
      }
    };
  }

  formatValidObject(obj) {
    const { method, path, status, protocol, duration, contentLength, userAgent, ...remainingProperties } = obj;

    const defaultObject = {
      severity: 'info',
      timestamp: new Date().toISOString(),
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

    return { ...defaultObject, ...remainingProperties };
  }
}

module.exports = JsonFormatter;
