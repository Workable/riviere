const defaultAdapter = require('../../../../lib/adapters/default');

describe('#defaultAdapter', () => {
  it('should be an object', () => {
    (typeof defaultAdapter === 'object').should.equal(true);
  });
});
