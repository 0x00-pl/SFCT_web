
let express = require('express');
let app = require('./src/app');

let server = express();

server.use(app);

server.listen(8888, function(){
    console.log("listening: 8888");
});


