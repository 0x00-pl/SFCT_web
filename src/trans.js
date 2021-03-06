let fs = require("fs");
let path = require("path");

function skip_string(text, pos){
    let [t,p] = [text,pos];
    if(t[p]!='"'){
        return p;
    }
    p++;
    while(p < t.length){
        if(t[p]=="\""){
            if(t[p+1]!="\""){
                return p+1;
            }
        }
        p++;
    }

    return p;
}

function skip_comment(text, pos){
    let [t,p] = [text,pos];
    if(t[p]!="(" || t[p+1]!="*"){
        return p;
    }
    p+=2;
    while(p < t.length){
        if(t[p]=="*" && t[p+1]==")"){
            return p+2;
        }else if(t[p]=="\""){
            p = skip_string(t,p);
        }else if(t[p]=="(" && t[p+1]=="*"){
            p = skip_comment(t,p);
        }else{
            p++;
        }
    }
    return p;
}

function destruct_text(text){
    let p = 0; let t = text;
    let r = [];
    let buff = "";
    while(p < t.length){
        if(t[p]=="(" && t[p+1]=="*"){
            if(buff!=""){
                r = r.concat(buff);
                buff = "";
            }

            let end = skip_comment(t, p);
            r = r.concat(t.substring(p, end));
            p = end;
        }else if(t[p]=='"'){
            let end = skip_string(t, p);
            buff = buff.concat(t.substring(p, end));
            p = end;
        }else{
            buff = buff.concat(t[p]);
            p++;
        }
    }
    if(buff!=""){
        r = r.concat(buff);
        buff = "";
    }
    return r;
}

function construct_text(bundle){
    return bundle.join("");
}

function translate_bundle(bundle, src_path, _trans_handler){
    return bundle.map((v,i)=>_trans_handler(v, src_path, i));
}

function trans_text(text, src_path, _trans_handler){
    let bundle = destruct_text(text);
    let bundle_new = translate_bundle(bundle, src_path, _trans_handler);
    let text_new = construct_text(bundle_new);
    return text_new;
}

function trans_file(src_path, dst_path, _trans_handler){
    src_path = path.normalize(src_path);
    if(dst_path != ""){
        dst_path = path.normalize(dst_path);
    }

    let text = fs.readFileSync(src_path, {encoding:"utf-8"});
    if(text == null){
        return "Cannot read file:"+src_path;
    }
    let transed_text = trans_text(text, src_path, _trans_handler);
    if(dst_path != ""){
        fs.writeFileSync(dst_path, transed_text, {encoding:"utf-8"});
    }
    return null;
}

function mkdir_p(path) {
    if(path==""){ return; }
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

function trans_vfile_dir(src_dir, dst_dir, _trans_handler){
    src_dir = path.normalize(src_dir);
    if(dst_dir != ""){
        dst_dir = path.normalize(dst_dir);
        mkdir_p(dst_dir);
    }

    let files = fs.readdirSync(src_dir, {encoding:"utf8"});
    files.forEach(function(name){
        let src_path = path.join(src_dir, name);
        let dst_path = dst_dir==""? "": path.join(dst_dir, name);

        let stat = fs.statSync(src_path);
        if(!stat){ return; }
        if(stat.isDirectory()){
            trans_vfile_dir(src_path, dst_path, _trans_handler);
        }else if(name.endsWith(".v")){
            trans_file(src_path, dst_path, _trans_handler);
        }else{
            // ignore
        }
    });
}

module.exports = {
    trans_vfile_dir
};

