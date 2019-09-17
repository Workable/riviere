const MissingFormatter = require('../../../lib/formatters/MissingFormatter');

describe('Test Missing Formatter', () => {
  it('formatObject should return unexpected formatter empty', () => {
    this.missingFormatter = new MissingFormatter();
    const payload = this.missingFormatter.formatObject({});
    payload.should.equal('Unexpected formatter: ');
  });
  it('formatObject should return unexpected formatter', () => {
    const style = 'unknown';
    this.missingFormatter = new MissingFormatter(style);
    const payload = this.missingFormatter.formatObject({});
    payload.should.equal('Unexpected formatter: ' + style);
  });
});
