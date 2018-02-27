const http = require('http');
const https = require('https');

module.exports = {
  proxy: handler => {
    http.request = new Proxy(http.request, handler);
  }
};
