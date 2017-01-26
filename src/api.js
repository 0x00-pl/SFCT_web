let express = require('express');
let archiver = require('archiver');
let database = require('./database.js');
let ccb = require('./ccb.js');


let api_router = express.Router();
//api_router.use(bodyParser.json());
let db = database.connect_db();

let cache_transed_count = [];

function get_transed_count(chapter_id, cb){
    if(cache_transed_count[chapter_id] != null){
        cb(cache_transed_count[chapter_id]);
    }else{
        trans_chapter(chapter_id, function(){
            cb(cache_transed_count[chapter_id]);
        });
    }
}

let read_all = function(req, cb){
    let data = '';
    req.on('data', function(chunck){ data = data.concat(chunck); });
    req.on('end', function(){ cb(data); });
};

api_router.get("/index", function(req, res){
    let rows_len = 0;
    let rows = [];

    ccb(function(cb){
        database.select_text_index(db, cb);
    }).then(function([err, rows], cb){
        if(err){console.log(err);throw err;}
        rows.forEach(function(v, i){
            get_transed_count(v.id, (counts)=>cb(rows.length, i, Object.assign({}, v, {counts})));
        });
    }).then(function(n, i, v, cb){
        rows[i] = v;
        rows_len += 1;
        if(rows_len >= n){
            cb(rows);
        }
    }).then(function(rows){
        res.json(rows);
    }).end()();
});

api_router.post("/i18n", function(req, res){
    ccb(function(cb){
        read_all(req, cb);
    }).then(function(data, cb){
        data = JSON.parse(data);
        database.insert_i18n_zhcn(db, data.src, data.dst, cb);
    }).then(function(r){
        res.send("{}");
    }).end()();
});

function trans_chapter(chapter_id, cb){
    let blocks = [];
    let blocks_size = 0;
    let trans_need = 0;
    let trans_done = 0;

    function make_block(origin, i18n_list){
        if(origin.type == 'text'){
            trans_need += 1;
            if(i18n_list.length != 0){ trans_done += 1; }
            return {"origin": origin.content, "type": "text", "i18n": i18n_list, "extra": origin};
        }else{
            return {"origin": origin.content, "type": origin.type, "extra": origin};
        }
    }

    ccb(function(cb){
        database.select_text_origin(db, chapter_id, cb);
    }).then(function([err, rows], cb){
        if(err){console.log(err);throw err;}
        let n = rows.length;
        if(n==0){cb(0); return;}

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
    }).then(function(){
        cache_transed_count[chapter_id] = [trans_done, trans_need];
        cb(blocks);
    }).end()();
}

api_router.get("/chapter/:chapter", function(req, res){
    let chapter_id = req.params.chapter;
    trans_chapter(chapter_id, function(blocks){
        res.json(blocks);
    });
});

api_router.get('/download/vfa', function(req, res){
    let filename = 'vfa.zip';
    let mimetype = 'application/zip, application/octet-stream';
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    let archive = archiver.create('zip', {});
    archive.pipe(res);
    archive.directory('SFCTSVN_zhcn/vfa/full').finalize();
});

api_router.get('/download/sf', function(req, res){
    let filename = 'sf.zip';
    let mimetype = 'application/zip, application/octet-stream';
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    let archive = archiver.create('zip', {});
    archive.pipe(res);
    archive.directory('SFCTSVN_zhcn/sf/full').finalize();
});

/*
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
        database.insert_i18n_zhcn(db, '(*text in chapter #0*)', '(*#0*)', cb);
    }).then(function([err,value]){
        res.end();
    }).end()();
});*/

module.exports = api_router;
