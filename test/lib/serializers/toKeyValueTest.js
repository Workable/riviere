const { test } = require('ava');

const serialize = require('../../../lib/serializers/toKeyValue');

const now = new Date();

test('should serialize an object', t => {
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
  t.is(
    res,
    'testStr="testStrOk", testArr=[testItem1="testItem1Ok", testItem2="testItem2Ok"], testBool=true, testBoolFalse=false, testSymbol="Symbol(test)", testDate=' +
      now.toString() +
      ', testNum=1'
  );
  t.pass();
});

test('should serialize a string', t => {
  const input = 'ok';
  const res = serialize(input);
  t.is(res, '"ok"');
  t.pass();
});

test('should serialize a number', t => {
  const input = 2;
  const res = serialize(input);
  t.is(res, 2);
  t.pass();
});
