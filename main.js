
let express = require('express');
let app = require('./src/app');

let server = express();

server.use(app);

server.listen(80, function(){
    console.log("listening: 80");
});


