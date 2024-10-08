const merge = require('lodash/merge');
const BaseFormatter = require('./BaseFormatter');

class JsonFormatter extends BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '', loggerCallback = null) {
    super(false, appendDate, requestType, loggerCallback);
  }

  formatObject(obj) {
    let jsonObject = obj instanceof Error ? this.formatErrorObject(obj) : this.formatValidObject(obj);
    if (this.loggerCallback && typeof this.loggerCallback === 'function') {
      this.loggerCallback(jsonObject);
    }
    return JSON.stringify(jsonObject);
  }

  formatErrorObject(obj) {
    return {
      severity: 'error',
      timestamp: new Date().toISOString(),
      message: obj.message,
      stack_trace: obj.stack,
      httpRequest: {
        requestMethod: obj.context.method,
        requestUrl: obj.context.path,
        protocol: obj.context.protocol,
        latency: '0s',
        responseSize: 0
      },
      'logging.googleapis.com/operation': {
        id: obj.context.requestId
      }
    };
  }

  formatValidObject(obj) {
    const {
      method,
      path,
      status,
      protocol,
      duration,
      contentLength,
      userAgent,
      metaBody = {},
      metaHeaders = {},
      ...remainingProperties
    } = obj;

    const defaultObject = {
      severity: 'info',
      timestamp: new Date().toISOString(),
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        status: status,
        protocol: protocol,
        latency: duration ? (Number(duration) / 1000).toFixed(6) + 's' : '0s',
        responseSize: contentLength || 0,
        userAgent: userAgent
      },
      'logging.googleapis.com/operation': {
        id: obj.requestId
      }
    };
    const meta = merge(metaBody, metaHeaders);
    return {
      ...defaultObject,
      ...meta,
      ...remainingProperties
    };
  }
}

module.exports = JsonFormatter;
