var sqlite3 = require('sqlite3');

function connect_db(db_name='SFCT.sqlite3'){
    return new sqlite3.Database(db_name);
}

function create_tables(db){
    db.run('create table origin ('+
           ' id int,'+
           ' type char(10),'+
           ' content text'+
           ')');
}

module.exports = {
    connect_db: connect_db,
    create_tables: create_tables
};
