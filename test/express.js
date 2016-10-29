let expect = require('expect.js');

let express = require('express');

describe('express', function(){
    it('exist', function(){
        expect(express).not.eql(null);
    });
});
