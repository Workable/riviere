const formatterResolver = require('../../../lib/formatters/FormatterResolver');
const SimpleFormatter = require('../../../lib/formatters/SimpleFormatter');
const ExtendedFormatter = require('../../../lib/formatters/ExtendedFormatter');
const JsonFormatter = require('../../../lib/formatters/JsonFormatter');
const MissingFormatter = require('../../../lib/formatters/MissingFormatter');

describe('Test Formatter Resolver', () => {
  it('should return MissingFormatter for not existing formatter', () => {
    const formatter = formatterResolver();
    formatter.should.be.instanceOf(MissingFormatter);
  });

  it('should return a simple formatter object for type: simple, color: false, date: false', () => {
    const formatter = formatterResolver('simple');
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
    formatter.requestType.should.equal('');
  });

  it('should return a simple formatter object for type: simple, color: true, date: false', () => {
    const formatter = formatterResolver('simple', true, false);
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(true);
    formatter.appendDate.should.equal(false);
    formatter.requestType.should.equal('');
  });

  it('should return a simple formatter object for type: simple, color: true, date: false, requestTpe: test', () => {
    const formatter = formatterResolver('simple', true, false, 'test');
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(true);
    formatter.appendDate.should.equal(false);
    formatter.requestType.should.equal('test');
  });

  it('should return a simple formatter object for type: simple, color: false, date: true', () => {
    const formatter = formatterResolver('simple', false, true);
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(true);
    formatter.requestType.should.equal('');
  });

  it('should return a simple formatter object for type: simple, color: false, date: true, requestTpe: test', () => {
    const formatter = formatterResolver('simple', false, true, 'test');
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(true);
    formatter.requestType.should.equal('test');
  });

  it('should return a simple formatter object for type: simple, color: true, date: true', () => {
    const formatter = formatterResolver('simple', true, true);
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(true);
    formatter.appendDate.should.equal(true);
    formatter.requestType.should.equal('');
  });

  it('should return a simple formatter object for type: simple, color: true, date: true, requestTpe: test', () => {
    const formatter = formatterResolver('simple', true, true, 'test');
    formatter.should.be.instanceOf(SimpleFormatter);
    formatter.color.should.equal(true);
    formatter.appendDate.should.equal(true);
    formatter.requestType.should.equal('test');
  });

  it('should return an extended formatter object for type: extended', () => {
    const formatter = formatterResolver('extended');
    formatter.should.be.instanceOf(ExtendedFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
  });

  it('should return an extended formatter object for type: extended', () => {
    const formatter = formatterResolver('extended', true, false, 'test');
    formatter.should.be.instanceOf(ExtendedFormatter);
    formatter.color.should.equal(true);
    formatter.appendDate.should.equal(false);
  });

  it('should return a json formatter object for type: json', () => {
    const formatter = formatterResolver('json');
    formatter.should.be.instanceOf(JsonFormatter);
    formatter.color.should.equal(false);
    formatter.appendDate.should.equal(false);
  });
});
