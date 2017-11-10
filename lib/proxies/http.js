const http = require('http');
const https = require('https');
const semver = require('semver');

const shouldPatchHttpAndHttps = semver.satisfies(process.version, '>=8.9.0');

module.exports = {
  proxy: handler => {
    http.request = new Proxy(http.request, handler);
    if (shouldPatchHttpAndHttps) {
      https.request = new Proxy(https.request, handler);
    }
  }
};
