let express = require('express');
let database = require('./database.js');
let ccb = require('./ccb.js');


let api_router = express.Router();
//api_router.use(bodyParser.json());
let db = database.connect_db();

let read_all = function(req, cb){
    let data = '';
    req.on('data', function(chunck){ data = data.concat(chunck); });
    req.on('end', function(){ cb(data); });
};

api_router.get("/index", function(req, res){
    database.select_text_index(db, function([err, rows]){
        if(err){console.log(err);throw err;}
        res.json(rows);
    });
});

api_router.post("/i18n", function(req, res){
    ccb(function(cb){
        read_all(req, cb);
    }).then(function(data, cb){
        data = JSON.parse(data);
        database.insert_i18n_zhcn(db, data.src, data.dst, cb);
    }).then(function(r){
        console.log("[r]: ", r);
        res.send("{}");
    }).end()();
});

api_router.get("/chapter/:chapter", function(req, res){
    let blocks = [];
    let blocks_size = 0;

    function make_block(origin, i18n_list){
        if(origin.type == 'text'){
            return {"origin": origin.content, "type": "text", "i18n": i18n_list, "extra": origin};
        }else{
            return {"origin": origin.content, "type": origin.type, "extra": origin};
        }
    }

    ccb(function(cb){
        database.select_text_origin(db, req.params.chapter, cb);
    }).then(function([err, rows], cb){
        if(err){console.log(err);throw err;}
        let n = rows.length;
        rows.forEach(function(v,i){
            if(v.type == 'text'){
                database.select_i18n_zhcn(db, v.content, function([err,rows]){
                    if(err){rows = [v.content];}
                    blocks[i] = make_block(v, rows);
                    cb(n);
                });
            }else{
                blocks[i] = make_block(v, "[debug]: make_block.");
                cb(n);
            }
        });
    }).then(function(n, cb){
        blocks_size += 1;
        if(blocks_size >= n){
            cb();
        }
    }).then(function(cb){
        res.json(blocks);
    }).end()();
});

api_router.get("/init/create_db", function(req, res){
    database.create_tables(db, function(err){
        res.end("with"+JSON.stringify(err));
    });
});
api_router.get("/init/insert_test_data", function(req, res){
    ccb(function(cb){
        database.insert_text_index(db, 0, "chapter#0", cb);
    }).then(function([err,value], cb){
        database.insert_text_origin(db, 0, 0, 'text', '(*text in chapter #0*)', cb);
    }).then(function([err,value], cb){
        database.insert_i18n_zhcn(db, '(*text in chapter #0*)', '(*#0里面的字*)', cb);
    }).then(function([err,value], cb){
        database.insert_i18n_zhcn(db, '(*text in chapter #0*)', '(*#0的字*)', cb);
    }).then(function([err,value]){
        res.end();
    }).end()();
});

module.exports = api_router;
