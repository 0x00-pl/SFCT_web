let fs = require("fs");


function destruct_text(text){
    return [text];  // TODO
}

function construct_text(bundle){
    return bundle[0];  // TODO
}

function translate_bundle(bundle){
    return bundle;  // TODO
}

function trans_text(text){
    let bundle = destruct_text(text);
    let bundle_new = translate_bundle(bundle);
    let text_new = construct_text(bundle_new);
    return text_new;
}


function trans_file(src_path. dst_path){
    let text = fs.readFileSync(src_path, {encoding:"utf-8"});
    if(text == null){return "Cannot read file:"+src_path;}
    let transed_text = trans_text(text);
    fs.writeFIleSync(dst_path, transed_text, {encoding:"utf-8"});
}

