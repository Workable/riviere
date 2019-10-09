const BaseFormatter = require('./BaseFormatter');
const chalk = require('chalk');
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
    if (options && options.traceHeaderName) {
      rest.metaHeaders && delete rest.metaHeaders['headers.' + options.traceHeaderName.toLowerCase()];
    }
    let restStr = serialize(rest);
    if (restStr.length > 0) restStr = ` | ${restStr}`;

    const tag = this.appendTag ? '[s] ' : '';

    if (this.color) {
      return chalk.grey(tag) + this.getPrefix(obj) + chalk.grey(restStr);
    } else {
      return tag + this.getPrefix(obj) + restStr;
    }
  }
}

module.exports = SimpleFormatter;
