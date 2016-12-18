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
            ' id int primary key,'+
            ' name text,'+
            ' info text'+
            ')'
    ).exec(
        'create table chapter ('+
            ' id int primary key,'+
            ' name text'+
            ')'
    ).exec(
        'create table text_origin ('+
            ' chapter_id int,'+
            ' block_id int,'+
            ' type char(10),'+
            ' content text,'+
            ' primary key (chapter_id, block_id)'+
            ')'
    ).exec(
        'create table i18n_zhcn ('+
            ' id int primary key,'+
            ' src text,'+
            ' dst text,'+
            ' votes int default 0'+
            ')',
        cb
    );
}

function drop_tables(db, cb){
    db.exec(
        'drop table user'
    ).exec(
        'drop table chapter'
    ).exec(
        'drop table text_origin'
    ).exec(
        'drop table i18n_zhcn',
        cb
    );
}

function select_text_origin(db, chapter_id, cb){
    db.all('select * from text_origin '+
           'where chapter_id=? '+
           'order by block_id limit ?;',
           chapter_id, 1000,
           accumulate_args(cb)
          );
}
function insert_text_origin(db, chapter_id, block_id, type, content, cb){
    db.run('insert into text_origin '+
           '(chapter_id, block_id, type, content) '+
           'values(?,?,?,?);',
           chapter_id, block_id, type, content,
           accumulate_args(cb)
          );
}
function select_i18n_zhcn(db, src, cb){
    db.all('select * from i18n_zhcn '+
           'where src=? '+
           'order by votes desc limit ?;',
           src, 1000,
           accumulate_args(cb)
          );
}
function insert_i18n_zhcn(db, src, dst, cb){
    db.run('insert into i18n_zhcn '+
           '(src, dst) '+
           'values(?,?);',
           src, dst,
           accumulate_args(cb)
          );
}
function vote_i18n_zhcn(db, _id, votes, cb){
    db.run('update i18n_zhcn '+
           'set votes=votes+? '+
           'where id=?;',
           votes, _id,
           accumulate_args(cb)
          );
}

function select_text_index(db, cb){
    db.all('select * from chapter '+
           'order by id limit ?;', 1000,
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
    insert_text_origin,
    select_text_origin,
    insert_text_index,
    select_text_index,
    select_i18n_zhcn,
    insert_i18n_zhcn,
    vote_i18n_zhcn
};
