let expect = require('expect.js');
let jsdom = require('jsdom');
let promise = require('promise');

describe("promise", function(){
    it("promise", function(done){
        (new promise(function(resolve){
            resolve(0);
        })).then(function(value){
            return value+1;
        }).then(function(value){
            expect(value).eql(1);
            done();
        });
    });
    it("resolve", function(done){
        promise.resolve(
            0
        ).then(function(value){
            expect(value).eql(0);
            done();
        });
    });
});

describe("jsdom", function(){
    it("jsdom is running", function(done){
        (new promise(function(resolve){
            jsdom.env({
                html: "<html><head></head><body><script>function jsdom_run(){document.body.innerHTML = 'ok';}</script></body></html>",
                features: {
                    // FetchExternalResources : ['script'],
                    // ProcessExternalResources : ['script']
                },
                done: function(err,window){resolve([err, window]);}
            });
        })).then(function([err, window]){
            expect(err).eql(null);
            window.jsdom_run();
            return jsdom.serializeDocument(window.document);
        }).then(function(html){
            expect(html).equal('<html><head></head><body>ok</body></html>');
            done();
        });
    });
});
