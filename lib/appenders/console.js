const getFormat = require('./format');
const formatterResolver = require('../formatters/FormatterResolver');

const getOut = (opts = {}) => {
  const color = !!opts.color;
  const styles = opts.styles;
  const date = true;
  const format = getFormat(color, date);

  const out = data => {
    if (data.log_tag) {
      for (const i in styles) {
        const formatter = formatterResolver(styles[i], color, date, data.log_tag);
        const fmt = formatter.formatObject(data);
        process.stdout.write(`${fmt}\n`);
      }
    } else if (data instanceof Error && data.params && data.params.log_tag) {
      const formatErrMsg = format[data.params.log_tag];

      if (formatErrMsg && typeof formatErrMsg === 'function') {
        const fmtErr = formatErrMsg(data);
        process.stdout.write(`${fmtErr}\n`);
      }
    }
  };

  return out;
};

module.exports = getOut;
