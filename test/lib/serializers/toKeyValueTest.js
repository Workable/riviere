const serialize = require('../../../lib/serializers/toKeyValue');

const now = new Date();

describe('#toKeyValueTest', () => {
  describe('.toKeyValue()', () => {
    it('should serialize an object', () => {
      const input = {
        testStr: 'testStrOk',
        testArr: [
          {
            testItem1: 'testItem1Ok'
          },
          {
            testItem2: 'testItem2Ok'
          }
        ],
        testBool: true,
        testBoolFalse: false,
        testSymbol: Symbol('test'),
        testNull: null,
        testDate: now,
        testNum: 1
      };

      const res = serialize(input);
      res.should.equal(
        'testStr="testStrOk", testArr=[testItem1="testItem1Ok", ' +
          'testItem2="testItem2Ok"], testBool=true, testBoolFalse=false, ' +
          'testSymbol="Symbol(test)", testDate=' +
          now.toString() +
          ', testNum=1'
      );
    });

    it('should serialize a string', () => {
      const input = 'ok';
      const res = serialize(input);
      res.should.equal('"ok"');
    });

    it('should serialize a number', () => {
      const input = 2;
      const res = serialize(input);
      res.should.equal(2);
    });
  });
});
