const formatterResolver = require('../formatters/FormatterResolver');

const getOut = (opts = {}) => {
  const color = !!opts.color;
  const styles = opts.styles;
  const loggerCallback = opts.loggerCallback;
  const date = true;

  const out = (data, options) => {
    let log_tag = undefined;
    if (data.log_tag) {
      log_tag = data.log_tag;
    } else if (data instanceof Error && data.params && data.params.log_tag) {
      log_tag = data.params.log_tag;
    }

    if (log_tag) {
      for (const i in styles) {
        const formatter = formatterResolver(styles[i], color, date, log_tag, loggerCallback);
        const fmt = formatter.formatObject(data, options);
        process.stdout.write(`${fmt}\n`);
      }
    }
  };

  return out;
};

module.exports = getOut;
