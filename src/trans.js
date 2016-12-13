let fs = require("fs");
let path = require("path");

let __trans_handler = (x=>x);

function trans_handler(h){
    if(h != null){
        __trans_handler = h;
    }
    return __trans_handler;
}

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

function translate_bundle(bundle){
    return bundle.map(__trans_handler);
}

function trans_text(text){
    let bundle = destruct_text(text);
    let bundle_new = translate_bundle(bundle);
    let text_new = construct_text(bundle_new);
    return text_new;
}

function trans_file(src_path, dst_path){
    src_path = path.normalize(src_path);
    dst_path = path.normalize(dst_path);

    let text = fs.readFileSync(src_path, {encoding:"utf-8"});
    if(text == null){
        return "Cannot read file:"+src_path;
    }
    let transed_text = trans_text(text);
    fs.writeFileSync(dst_path, transed_text, {encoding:"utf-8"});
    return null;
}

function trans_vfile_dir(src_dir, dst_dir, _trans_handler){
    trans_handler(_trans_handler || (x=>x));
    src_dir = path.normalize(src_dir);
    dst_dir = path.normalize(dst_dir);

    let files = fs.readdirSync(src_dir);
    let vfiles = files.filter(x => x.endsWith(".v"), {encoding:"utf-8"});
    vfiles.forEach(function(v){
        trans_file(path.join(src_dir, v), path.join(dst_dir, v));
    });
}

module.exports = {
    trans_vfile_dir
};

