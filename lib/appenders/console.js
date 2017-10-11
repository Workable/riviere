const getFormat = require('./format');

const getOut = opts => {
  const color = opts.color;
  const date = true;
  const format = getFormat(color, date);

  const out = data => {
    const formatMsg = format[data.log_tag];
    if (formatMsg && typeof formatMsg === 'function') {
      const fmt = formatMsg(data);
      process.stdout.write(`${fmt}\n`);
    }
  };

  return out;
};

module.exports = getOut;
