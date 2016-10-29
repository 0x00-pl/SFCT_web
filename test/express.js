let except = require('except');

let express = require('express');

describe('express', function(){
    it('exist', function(){
        except(express).not.eql(null);
    });
});
