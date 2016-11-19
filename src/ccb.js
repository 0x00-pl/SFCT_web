
function curry_end(f, cb){
    return function(...args){
        f.apply(args.concat(cb));
    };
}

function ccb(f){
    let ret = {
        entry: null,
        func: f,
        next_block: null,
        then: then,
        make_cb: make_cb,
        end: end
    };
    ret.entry = ret;
    return ret;

    function then(g){
        let next_block = ccb(g);
        next_block.entry = this.entry;
        this.next_block = next_block;
        return next_block;
    }
    function make_cb(){
        let thiz = this;
        if(this.next_block==null){
            return function(...args){thiz.func.apply(null, args);};
        }else{
            let cb = this.next_block.make_cb();
            return function(...args){thiz.func.apply(null, args.concat([cb]));};
        }
    }
    function end(){
        return this.entry.make_cb();
    }
}

module.exports = ccb;
