var EventStoreClient = require('../eventstore.js').EventStoreClient;
var MongoClient = require('mongodb').MongoClient;   
var Config = require('../config.js').Config;

module.exports = {
    setUp: function (callback) {
        this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    test : function (test ) {
        test.done();
    },
    hello_world_should_add_something_test: function (test) {

        EventStoreClient.helloWorld(function() {

            MongoClient.connect(Config.connectionstring, function(err, db) { 

                var collection = db.collection('test_insert');

                collection.count(function(err, count) {
                    test.equals(count > 0, true);
                    test.done();
                });
                
            });            

        });        
    }
};