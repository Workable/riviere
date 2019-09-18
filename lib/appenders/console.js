const formatterResolver = require('../formatters/FormatterResolver');

const getOut = (opts = {}) => {
  const color = !!opts.color;
  const styles = opts.styles;
  const date = true;

  const out = data => {
    let log_tag = undefined;
    if (data.log_tag) {
      log_tag = data.log_tag;
    } else if (data instanceof Error && data.params && data.params.log_tag) {
      log_tag = data.params.log_tag;
    }

    if (log_tag) {
      for (const i in styles) {
        const formatter = formatterResolver(styles[i], color, date, log_tag);
        const fmt = formatter.formatObject(data);
        process.stdout.write(`${fmt}\n`);
      }
    }

    // if (data.log_tag) {
    //   for (const i in styles) {
    //     const formatter = formatterResolver(styles[i], color, date, data.log_tag);
    //     const fmt = formatter.formatObject(data);
    //     process.stdout.write(`${fmt}\n`);
    //   }
    // } else if (data instanceof Error && data.params && data.params.log_tag) {
    //   for (const i in styles) {
    //     const formatter = formatterResolver(styles[i], color, date, data.params.log_tag);
    //     const fmtErr = formatter.formatObject(data);
    //     process.stdout.write(`${fmtErr}\n`);
    //   }
    // }
  };

  return out;
};

module.exports = getOut;
