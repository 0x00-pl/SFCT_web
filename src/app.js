let express = require('express');
let jsdom = require('jsdom');
let database = require('./database.js');
let promise = require('promise');
let fs = require('fs');
let ccb = require('./ccb.js');

let app = express.Router();
let api_router = require('./api.js');

// midwire
app.use(function(req, res, next){
    console.log("LOG : ", req.method, req.url);
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

app.get("/", function(req, res){
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

function static_file(file_name){
    app.get("/"+file_name, function(req, res){
        ccb(function(cb){
            fs.readFile("static/"+file_name, cb);
        }).then(function(err, content){
            if(err){res.status(404).end();}
            res.end(content);
        }).end()();
    });
}
static_file("jquery.js");
static_file("main.css");

app.use("/api", api_router);



module.exports = app;
