const should = require('should');
const options = require('../../../lib/options');

describe('options', () => {
  describe('context', () => {
    it('the "context" should return an empty object: "{}" by default', () => {
      const o = options();
      o.context().should.eql({});
    });
  });

  describe('color', () => {
    it('the "color" value should be true if "color": true is passed in "options"', () => {
      const o = options({ color: true });
      o.color.should.equal(true);
    });
  });
});
