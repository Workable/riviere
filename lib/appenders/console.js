const getFormat = require('./format');

const getOut = opts => {
  const color = opts.color;
  const date = true;
  const format = getFormat(color, date);

  const out = data => {
    const formatMsg = format[data.log_tag];

    if (data.log_tag && formatMsg && typeof formatMsg === 'function') {
      const fmt = formatMsg(data);

      process.stdout.write(`${fmt}\n`);
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
