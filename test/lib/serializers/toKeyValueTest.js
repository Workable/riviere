const { test } = require('ava');

const serialize = require('../../../lib/serializers/toKeyValue');

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
        testDate: new Date('2017-07-31T11:58:41.904Z'),
        testNum: 1
    };

    const res = serialize(input);
    t.is(res, 'testStr="testStrOk", testArr=[testItem1="testItem1Ok", testItem2="testItem2Ok"], testBool=true, testBoolFalse=false, testSymbol="Symbol(test)", testDate=Mon Jul 31 2017 14:58:41 GMT+0300 (EEST), testNum=1');
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
