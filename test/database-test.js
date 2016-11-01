let expect = require('expect.js');
let promise = require('promise');
let database = require('../database');

describe("databse", function(){
    it('create database', function(){
        let db = database.connect_db('database-test.sqlite3');
        new promise(function(cb){
            database.create_tables(db, cb);
        }).then(function(){
            return new promise(function(cb){
                database.drop_tables(db, cb);
            });
        });
    });
});
