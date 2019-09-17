const formatterFactory = require('../../../lib/formatters/FormatterFactory');
const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');
const ExtendedFormatter = require('../../../lib/formatters/ExtendedFormatter');
const JsonFormatter = require('../../../lib/formatters/JsonFormatter');

const should = require('should');

describe('Test Formatter Factory', function() {
  it('should return null for not existing formatter', function() {
    const formatter = formatterFactory();
    should.equal(formatter, null);
  });

  it('should return a simple formatter object for type: simple', function() {
    const formatter = formatterFactory('simple');
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
  });

  it('should return an extended formatter object for type: extended', function() {
    const formatter = formatterFactory('extended');
    formatter.should.be.instanceOf(ExtendedFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
  });

  it('should return a json formatter object for type: json', function() {
    const formatter = formatterFactory('json');
    formatter.should.be.instanceOf(JsonFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
  });
});
