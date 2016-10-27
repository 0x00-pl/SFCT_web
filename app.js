let express = require('express');
let jsdom = require('jsdom');

let app = express.Router();

// midwire
app.use(function(req, res, next){
    console.log("URL : ", req.url);
    console.log("Mode: ", req.method);
    next();
});


app.get("/", function(req, res){
    jsdom.env({
        file: "index.html",
        features: {
            // FetchExternalResources : ['script'],
            // ProcessExternalResources : ['script']
        },
        done: next
    });
    function next(err, window){
        if(err){
            res.status(404).end();
        }
        console.log(window.pre_render());
        res.end(jsdom.serializeDocument(window.document));
    }
    function next2(){
    }
});


module.exports = app;
