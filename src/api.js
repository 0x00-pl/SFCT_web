let express = require('express');
let database = require('./database.js');


let api_router = express.Router();
let db = database.connect_db();

api_router.get("/index", function(req, res){
    database.select_text_index(db, function([err, rows]){
        if(err){console.log(err);throw err;}
        res.json(rows);
    });
});
api_router.get("/chapter/:chapter", function(req, res){
    database.select_text_origin(db, req.params.chapter, function(err, rows){
        if(err){console.log(err);throw err;}
        res.json(rows);
    });
});

api_router.get("/init/create_db", function(req, res){
    database.create_tables(db, function(err){
        res.end("with"+JSON.stringify(err));
    });
});
api_router.get("/init/insert_test_data", function(req, res){
    ccb(function(cb){
        database.insert_text_index(cb, 0, "chapter#0", cb);
    }).then(function([err,value]){
        res(end);
    }).end();
});

module.exports = api_router;
