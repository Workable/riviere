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

  describe('appendTag', () => {
    it('the "appendTag" value should be false if "appendTag": false is passed in "options"', () => {
      const o = options({ appendTag: false });
      o.appendTag.should.equal(false);
    });

    it('the "appendTag" value should be true if "appendTag": is not passed in "options"', () => {
      const o = options({});
      o.appendTag.should.equal(true);
    });
  });

  describe('styles', () => {
    it('the "styles" value should be [\'simple\'] if "styles" is not passed in "options"', () => {
      const o = options({});
      o.styles.length.should.equal(1);
      o.styles[0].should.equal('simple');
    });

    it('the "styles" value should be [\'json\'] if "appendTag":[\'json\'] is passed in "options"', () => {
      const o = options({ styles: ['json'] });
      o.styles.length.should.equal(1);
      o.styles[0].should.equal('json');
    });
  });
});
