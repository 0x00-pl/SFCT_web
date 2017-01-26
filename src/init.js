let database = require('./database.js');
let trans = require('./trans.js');
let ccb = require('./ccb.js');

function append_text(pool, src_path, idx, text){
    pool[src_path] = pool[src_path] || [];
    pool[src_path][idx] = text;
}

function call_all_task(task_arr, cb){
    let n = task_arr.length;
    let ret = [];
    if(n==0){
        cb(ret);
    }else{
        let m = 0;
        function cb_handler(v){
            ret[m] = v;
            m++;
            console.log('[process]: ', m, '/', n);
            if(m >= n){
                cb(ret);
            }else{
                task_arr[m](cb_handler);
            }
        }
        task_arr[0](cb_handler);
    }
}

function trans_vfile_visitor(db, src_dir, index_cb, block_cb, cb){
    let pool = {};

    function get_all_text(text, src_path, idx){
        append_text(pool, src_path, idx, text);
    }

    trans.trans_vfile_dir(src_dir, "", get_all_text);

    let chapter_id = 0;
    let tasks_index = [];
    let tasks_text = [];
    for(name in pool){
        tasks_index = tasks_index.concat(
            index_cb(chapter_id, name)
        );
        pool[name].forEach(function(content, block_id){
            tasks_text = tasks_text.concat(
                block_cb(chapter_id, block_id, content)
            );
        });
        chapter_id++;
    }
    ccb(function(cb1){
        call_all_task(tasks_index, cb1);
    }).then(function(index_res, cb2){
        call_all_task(
            tasks_text,
            (block_res)=>cb2([index_res, block_res])
        );
    }).then(function(res){
        cb(res);
    }).end()();
}

function db_init_origin(db, src_dir){

    function index_cb(chapter_id, name){
        return (cb)=>database.insert_text_index(db, chapter_id, name, cb);
    }
    function block_cb(chapter_id, block_id, content){
        let content_type = content.startsWith("(*")? "text": "code";
        return (cb)=>database.insert_text_origin(
            db, chapter_id, block_id, content_type, content, cb
        );
    }

    ccb(function(cb){
        trans_vfile_visitor(db, src_dir, index_cb, block_cb, cb);
    }).then(function([res1, res2]){
        console.log('[debug][init_origin]: ', res1, res2);
    }).end()();
}


function trans_vfiles(db, src_dir, dst_dir){
    let pool = {};

    function index_cb(chapter_id, name){
        return (cb)=>cb();
    }
    function block_cb(chapter_id, block_id, content){
        if(content.startsWith("(*")){
            return (cb)=>database.select_i18n_zhcn(
                db, content,
                function([err, res]){
                    if(res && res.length>0){
                        pool[content] = res[0]['dst'];
                    }
                    cb();
                }
            );
        }else{
            return (cb)=>cb();
        }
    }


    ccb(function(cb){
        trans_vfile_visitor(db, src_dir, index_cb, block_cb, cb);
    }).then(function([res1, res2]){
        trans.trans_vfile_dir(src_dir, dst_dir, function(src){
            return pool[src] || src;
        });
        //console.log('[debug][init_origin]: ', res1, res2);
    }).end()();
}


if(process.argv.length > 2){
    let src_dir = "SFCTSVN/";
    let dst_dir = "SFCTSVN_zhcn/";
    let db = database.connect_db();
    let args = process.argv.slice(2);
    if(args[0] == 'init_database'){
        database.create_tables(db, function(err){
            console.log('[info]: init database with err: ', err);
        });
    }else if(args[0] == 'init_origin'){
        db_init_origin(db, src_dir);
    }else if(args[0] == 'trans_vfile'){
        trans_vfiles(db, src_dir, dst_dir);
    }else if(args[0] == 'vote'){
        let _id = args[1];
        let votes = args[2];
        if(_id && votes){
            database.vote_i18n_zhcn(db, _id, votes, ()=>console.log('done.'));
        }else{
            console.log('usage: npm run vote -- <id> <count>');
        }
    }
}
