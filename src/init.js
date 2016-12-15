let database = require('./database.js');
let trans = require('./trans.js');
let ccb = require('./ccb.js');

function append_text(pool, src_path, idx, text){
    pool[src_path] = pool[src_path] || [];
    pool[src_path][idx] = text;
}

function call_all_task(task_arr, cb){
    let n = task_arr.length;
    let m = 0;
    let ret = [];
    for(var i=0; i<n; i++){
        function cb_handler(v){
            ret[i] = v;
            m++;
            if(m >= n){
                cb(ret);
            }
        }
        task_arr[i](cb_handler);
    }
}

function init_origin_text(db, src_dir, cb){
    let pool = {};

    function get_all_text(text, src_path, idx){
        append_text(pool, src_path, idx, text);
    }

    trans.trans_vfile_dir(src_dir, "", get_all_text);

    let chapter_id = 0;
    let tasks_index = [];
    let tasks_text = [];
    for(i in pool){
        let cp_chapter_id = chapter_id;
        let cp_i = i;
        tasks_index = tasks_index.concat(
            (cb1)=>database.insert_text_index(db, cp_chapter_id, cp_i, cb1)
        );
        pool[i].forEach(function(v, block_id){
            let content_type = v.startsWith("(*")? "text": "code";
            let cp_chapter_id = chapter_id;
            let cp_block_id = block_id;
            let cp_v = v;
            tasks_text = tasks_text.concat(
                (cb2)=>database.insert_text_origin(
                    db, cp_chapter_id, cp_block_id, content_type, cp_v, cb2
                )
            );
        });
        chapter_id++;
    }
    ccb(function(cb){
        call_all_task(tasks_index, cb);
    }).then(function(res, cb){
        call_all_task(tasks_text, cb);
    }).then(function(res){
    }).end()();
}

function db_init_origin(){
    let db = database.connect_db();
    ccb(function(cb){
        init_origin_text(db, 'vfile_src/', cb);
    }).then(function(res){
        console.log('[debug][init_origin]: ', res);
    }).end()();
}

db_init_origin();
