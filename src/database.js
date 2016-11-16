var sqlite3 = require('sqlite3');
var promise = require('promise');

function connect_db(db_name='SFCT.sqlite3'){
    return new sqlite3.Database(db_name);
}

function accumulate_args(cb){
    return function(){
        let args = [].slice.call(arguments);
        return cb(args);
    };
}

function debug_pipe(cb){
    return function(){
        let args = [].slice.call(arguments);
        console.log(args);
        return cb.apply(this, args);
    };
}

function create_tables(db, cb){
    db.exec(
        'create table user ('+
            ' id int,'+
            ' name text,'+
            ' info text'+
            ')'
    ).exec(
        'create table chapter ('+
            ' id int,'+
            ' name text'+
            ')'
    ).exec(
        'create table text_origin ('+
            ' chapter_id int,'+
            ' block_id int,'+
            ' type char(10),'+
            ' content text'+
            ')'
    ).exec(
        'create table trans_zhcn ('+
            ' id int,'+
            ' text_origin_id int,'+
            ' user_id int,'+
            ' content text'+
            ')', cb);
}

function drop_tables(db, cb){
    db.exec(
        'drop table user'
    ).exec(
        'drop table chapter'
    ).exec(
        'drop table text_origin'
    ).exec(
        'drop table trans_zhcn',
        cb
    );
}

function select_text_origin(db, chapter_id, cb){
    db.all('select * from text_origin '+
           'where chapter_id=? '+
           'limit ?;',
           chapter_id, 1000,
           accumulate_args(cb)
          );
}
function insert_text_origin(db, chapter_id, block, type, content, cb){
    db.run('insert into text_origin '+
           '(chapter_id, block_id, type, content) '+
           'values(?,?,?,?);',
           chapter_id, block, type, content,
           accumulate_args(cb)
          );
}
function select_text_index(db, cb){
    db.all('select * from chapter '+
           'limit ?;', 1000,
           accumulate_args(cb)
          );
}
function insert_text_index(db, _id, name, cb){
    db.run('insert into chapter '+
           '(id, name) '+
           'values(?,?);',
           _id, name,
           accumulate_args(cb)
          );
}

module.exports = {
    connect_db,
    create_tables,
    drop_tables,
    select_text_origin,
    insert_text_origin

};
