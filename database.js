var sqlite3 = require('sqlite3');
var promise = require('promise');

function connect_db(db_name='SFCT.sqlite3'){
    return new sqlite3.Database(db_name);
}

function create_tables(db, cb){
    db.exec(
        'create table text_origin ('+
            ' id int,'+
            ' chapter int,'+
            ' block_id int,'+
            ' type char(10),'+
            ' content text'+
            ')'
    ).exec(
        'create table user ('+
            ' id int,'+
            ' name text,'+
            ' info text'+
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
        'drop table text_origin'
    ).exec(
        'drop table user'
    ).exec(
        'drop table trans_zhcn',
        cb
    );
}

function insert_text_origin(db, chapter, block, type, content, cb){
    db.run('insert into text_origin'+
           '(chapter, block_id, type, content)'+
           'values(?,?,?,?)',
            chapter, block, type, content,
            cb
           );
}

module.exports = {
    connect_db,
    create_tables,
    drop_tables,
    insert_text_origin

};
