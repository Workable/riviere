const logTags = require('../logTags');
const chalk = require('chalk');
const colors = require('../appenders/colors');

const outRes = logTags.CATEGORY.OUTBOUND_RESPONSE;
const inReq = logTags.CATEGORY.INBOUND_REQUEST;
const outReq = logTags.CATEGORY.OUTBOUND_REQUEST;
const inRes = logTags.CATEGORY.INBOUND_RESPONSE;
const inReqH = logTags.CATEGORY.INBOUND_REQUEST_HEALTH;
const outResH = logTags.CATEGORY.OUTBOUND_RESPONSE_HEALTH;
const unexpectedErr = logTags.CATEGORY.UNEXPECTED_ERROR;

class BaseFormatter {
  constructor(color = false, appendDate = false, requestType = '') {
    this.color = color;
    this.appendDate = appendDate;
    this.requestType = requestType;
  }

  formatObject(obj) {
    throw new Error('Not implemented');
  }

  getPrefix(obj) {
    const prefixMapper = {
      [inReq.TAG]: obj => {
        return this.getInRequestPrefix(obj);
      },
      [outReq.TAG]: obj => {
        return this.getOutRequestPrefix(obj);
      },
      [inReqH.TAG]: obj => {
        return this.getInRequestHealthPrefix(obj);
      },
      [inRes.TAG]: obj => {
        return this.getInResponsePrefix(obj);
      },
      [outRes.TAG]: obj => {
        return this.getOutResponsePrefix(obj);
      },
      [outResH.TAG]: obj => {
        return this.getOutResponseHealthPrefix(obj);
      },
      [unexpectedErr.TAG]: obj => {
        return this.getUnexpectedErrorPrefix(obj);
      }
    };

    return prefixMapper[this.requestType] ? prefixMapper[this.requestType](obj) : '';
  }

  getInRequestPrefix(obj) {
    let prefix = `[${obj.requestId}] ${inReq.MSG} ${obj.method} ${obj.path}`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = chalk[[colors[inReq.TAG]]](prefix);
    }
    return prefix;
  }

  getOutRequestPrefix(obj) {
    let prefix = `[${obj.requestId}] ${outReq.MSG} ${obj.method} ${obj.href}`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = chalk[colors[outReq.TAG]](prefix);
    }
    return prefix;
  }

  getInResponsePrefix(obj) {
    const href = this.getHrefFromRes(obj);
    let prefix = `[${obj.requestId}] ${inRes.MSG} ${obj.method} ${href} ${obj.status} ${obj.duration}ms`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = obj.status < 400 ? chalk[colors[inRes.TAG]](prefix) : chalk[colors.err](prefix);
    }
    return prefix;
  }

  getOutResponsePrefix(obj) {
    let prefix = `[${obj.requestId}] ${outRes.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = obj.status < 400 ? chalk[colors[outRes.TAG]](prefix) : chalk[colors.err](prefix);
    }
    return prefix;
  }

  getInRequestHealthPrefix(obj) {
    let prefix = `${inReqH.MSG} ${obj.method} ${obj.path}`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = chalk[colors[inReqH.TAG]](prefix);
    }
    return prefix;
  }

  getOutResponseHealthPrefix(obj) {
    let prefix = `${outResH.MSG} ${obj.method} ${obj.path} ${obj.status} ${obj.duration}ms`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = obj.status < 400 ? chalk[colors[outResH.TAG]](prefix) : chalk[colors.err](prefix);
    }
    return prefix;
  }

  getUnexpectedErrorPrefix(obj) {
    let prefix = `[${obj.context.requestId}] ${obj.context.protocol} ${obj.context.method} ${obj.context.path} |`;
    if (this.appendDate) {
      prefix = `[${new Date().toISOString()}] ${prefix}`;
    }
    if (this.color) {
      prefix = chalk[colors[unexpectedErr.TAG]](prefix);
    }
    return `${prefix} ${obj.stack}`;
  }

  getHrefFromRes(obj) {
    const query = obj.query ? `?${obj.query}` : '';
    return obj.href || `${obj.protocol}://${obj.host}${obj.path || query}`;
  }
}

module.exports = BaseFormatter;
