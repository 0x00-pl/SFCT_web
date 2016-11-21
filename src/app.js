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

app.get("/jquery.js", function(req, res){
    ccb(function(cb){
        fs.readFile("static/jquery.js", cb);
    }).then(function(err, content){
        if(err){res.status(404).end();}
        res.end(content);
    }).end()();
});

app.use("/api", api_router);

app.get("/test/create_db", function(req, res){
    database.create_tables(db, function(err){
        res.end("with"+JSON.stringify(err));
    });
});


module.exports = app;
