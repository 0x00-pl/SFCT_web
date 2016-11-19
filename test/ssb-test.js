let expect = require('expect.js');
let ccb = require('../src/ccb.js');



describe('ccb', function(){
    it('native call', function(done){
        function inc(x, cb){ cb(x+1); }
        ccb(inc).then(function(value){
            expect(value).eql(3);
            done();
        }).end()(2);
    });
    it('chain call',function(done){
        function f(a, cb){ return cb(a+1); }
        function g(b, cb){ return cb(b+1); }
        ccb(f).then(g).then(function(value){
            expect(value).eql(3);
            done();
        }).end()(1);
    });
});
