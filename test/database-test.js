let expect = require('expect.js');
let promise = require('promise');
let database = require('../database.js');

describe("databse", function(){
    it('create database', function(done){
        let db = database.connect_db('database-test.sqlite3');
        new promise(function(cb){
            database.create_tables(db, cb);
        }).then(function(){
            database.drop_tables(db, done);
        });
    });
    describe('test iuds', function(){
        var db = undefined;
        before(function(done){
            db = database.connect_db('database-test.sqlite3');
            database.create_tables(db, done);
        });
        after(function(done){
            database.drop_tables(db, done);
        });
        describe('text_origin', function(){
            it('insert', function(done){
                database.insert_text_origin(db, 0, 0, 'code', 'Definiation', done);
            });
        });
    });
});



