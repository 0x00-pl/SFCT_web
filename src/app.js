let express = require('express');
let jsdom = require('jsdom');
let database = require('./database.js');
let promise = require('promise');
let fs = require('fs');

let app = express.Router();
let db = database.connect_db();

// midwire
app.use(function(req, res, next){
    console.log("URL : ", req.url);
    console.log("Mode: ", req.method);
    next();
});

function jsdom_pre_render(html, state, cb){
    if(cb == undefined){
        cb = state;
        state = undefined;
    }
    jsdom.env({
        html: html,
        features: {},
        done: function(err, window){
            if(err){throw err;}
            if(window.pre_render){ window.pre_render(state); }
            cb(jsdom.serializeDocument(window.document));
        }
    });
}

app.get("/index.html", function(req, res){
    new promise(function(cb){
        fs.readFile("static/index.html", function(err,content){cb(content);});
    }).then(function(content){
        return new promise(function(cb){
            jsdom_pre_render(content, cb);
        });
    }).then(function(content){
            res.end(content);
        });
});

app.get("/detail/:chapter", function(req, res){
    new promise(function(cb){
        fs.readFile("static/detail.html", function(err,content){cb(content);});
    }).then(function(content){
        return new promise(function(cb){
            jsdom_pre_render(content, cb);
        });
    }).then(function(content){
        res.end(content);
    });
});

app.get("/api/restful/chapter/:chapter/", function(req, res){
    console.log('in', req.params.chapter);
    database.select_text_origin(db, req.params.chapter, function(err, rows){
        if(err){console.log(err);throw err;}
        res.json(rows);
    });
});

app.get("/test/create_db", function(req, res){
    database.create_tables(db, function(err){
        res.end("with"+JSON.stringify(err));
    });
});


module.exports = app;
