var EventStoreClient = require('../eventstore.js').EventStoreClient;
var Config = require('../config.js').Config;
var MongoClient = require('mongodb').MongoClient;   

module.exports = {
    setUp: function (callback) {
        
        MongoClient.connect(Config.connectionstring, function(err, db) {
            var collection = db.collection('events', function(err, collection) {
                collection.remove({}, {}, function() {
                    callback();
                });
            });
        });

    },

    tearDown: function (callback) {        
        callback();
    },  

    when_creating_a_stream_it_is_created: function (test) {       

        EventStoreClient.createOrAppendToStream('stream', { a: 'b' } , function() {

            MongoClient.connect(Config.connectionstring, function(err, db) { 

                var collection = db.collection('events');

                collection.count(function(err, count) {
                    test.equals(count === 1, true);
                    test.done();
                });
            });             
                      
        });        
       
    },

    when_creating_an_event_with_null_body_an_exception_is_thrown : function(test) {

        test.throws(function() { EventStoreClient.createEvent(null); }, Error, 'expected body');
        test.done();

    },

    when_creating_an_event_with_undefined_body_an_exception_is_thrown : function(test) {

        test.throws(function() { EventStoreClient.createEvent(); }, Error, 'expected body');
        test.done();

    }

};