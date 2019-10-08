/*
Copyright (c) 2010 Charlie Robbins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
This is a patched winston key=value serialized method to put string values inside double quotes
this applies to single strings and to strings inside arrays
modifications:
1: filters out null, undefined, Buffer values and Symbol keys
2: wraps all strings, in double quotes
*/

const _ = require('lodash');

function serialize(obj, key) {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    obj = _.pickBy(obj, i => i !== null && typeof i !== 'undefined');
  }

  if (typeof obj === 'symbol') {
    obj = obj.toString();
  }

  if (typeof obj === 'string') {
    // patch
    return key ? key + '="' + obj + '"' : '"' + obj + '"';
  }

  if (typeof obj !== 'object') {
    return key ? key + '=' + obj : obj;
  }

  var msg = '',
    keys = Object.keys(obj),
    length = keys.length;

  for (var i = 0; i < length; i++) {
    let nestedMsg = '';
    if (Array.isArray(obj[keys[i]])) {
      nestedMsg += keys[i] + '=[';

      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
        nestedMsg += serialize(obj[keys[i]][j]);
        if (j < l - 1) {
          nestedMsg += ', ';
        }
      }

      nestedMsg += ']';
    } else if (obj[keys[i]] instanceof Date) {
      nestedMsg += keys[i] + '=' + obj[keys[i]];
    } else {
      nestedMsg += serialize(obj[keys[i]], keys[i]);
    }

    if (nestedMsg && i < length - 1) {
      nestedMsg += ', ';
    }
    msg += nestedMsg;
  }

  return msg;
}

module.exports = serialize;
