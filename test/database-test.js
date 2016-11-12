let expect = require('expect.js');
let promise = require('promise');
let database = require('../src/database.js');

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
            it('insert-select', function(done){
                (new promise(function(resolve){
                    database.insert_text_origin(db, 0, 0, 'code', 'Definiation', (err,val)=>resolve([err,val]));
                })).then(function([err, value]){
                    return new promise(function(resolve){
                        database.select_text_origin(db, 0, resolve);
                    });
                }).then(function([err, value]){
                    let r = [ { id: null,
                                chapter: 0,
                                block_id: 0,
                                type: 'code',
                                content: 'Definiation' } ];
                    expect(value).eql(r);
                    done();
                });
            });
        });
    });
});



