const BaseFormatter = require('./BaseFormatter');
const chalk = require('chalk');
const flat = require('flat');
const serialize = require('../serializers/toKeyValue');

class SimpleFormatter extends BaseFormatter {
  formatObject(obj, options) {
    const {
      status,
      duration,
      contentLength,
      method,
      href,
      host,
      protocol,
      port,
      path,
      log_tag,
      userAgent,
      requestId,
      ...rest
    } = obj;
    if (rest.metaHeaders) {
      rest.metaHeaders = flat(rest.metaHeaders, { safe: true });
    }
    if (rest.metaBody) {
      rest.metaBody = flat(rest.metaBody, { safe: true });
    }
    if (options && options.traceHeaderName) {
      rest.metaHeaders && delete rest.metaHeaders['headers.' + options.traceHeaderName.toLowerCase()];
    }
    let restStr = serialize(rest);
    if (restStr.length > 0) restStr = ` | ${restStr}`;
    if (this.color) {
      return this.getPrefix(obj) + chalk.grey(restStr);
    } else {
      return this.getPrefix(obj) + restStr;
    }
  }
}

module.exports = SimpleFormatter;
