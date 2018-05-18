const https = require('https');

module.exports = {
  proxy: handler => {
    https.request = new Proxy(https.request, handler);
  }
};
