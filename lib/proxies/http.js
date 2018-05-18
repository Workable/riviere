const http = require('http');

module.exports = {
  proxy: handler => {
    http.request = new Proxy(http.request, handler);
  }
};
