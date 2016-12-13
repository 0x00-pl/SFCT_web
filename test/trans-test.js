let expect = require('expect.js');
let ccb = require('../src/ccb.js');
let fs = require('fs');
let trans = require('../src/trans.js');

describe('trans-test', function(){
    after(function(){
        fs.unlinkSync('test/vfile_dst/Smallstep.v');
    });

    it('hold with no trans', function(done){
        trans.trans_vfile_dir('test/vfile_src', 'test/vfile_dst', x=>x);
        let src = fs.readFileSync('test/vfile_src/Smallstep.v');
        let dst = fs.readFileSync('test/vfile_dst/Smallstep.v');
        expect(dst).eql(src);
        done();
    });
});
