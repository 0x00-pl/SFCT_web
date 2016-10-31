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
            window.pre_render(state);
            cb(jsdom.serializeDocument(window.document));
        }
    });
}

app.get("/", function(req, res){
    new promise(function(cb){
        fs.readFile("index.html", function(err,content){cb(content);});
    }).then(function(content){
        return new promise(function(cb){
            jsdom_pre_render(content, cb);
    });}).then(function(content){
        res.end(content);
    });
});

app.get("/test/create_db", function(req, res){
    database.create_tables(db);
});


module.exports = app;
