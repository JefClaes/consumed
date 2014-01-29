var MongoClient = require('mongodb').MongoClient;		
var Config = require('./config.js').Config;

exports.EventStoreClient = function() {

	var collectionName = 'events';

	return {
		createEvent : function(body) {
			if (body === null || typeof body == 'undefined')
				throw new Error('body missing.');

			return {
				timestamp : new Date(),
				body : body
			}
		},

		createOrAppendToStream : function(streamId, events, success) {									    

			MongoClient.connect(Config.connectionstring, function(err, db) {
			    if(err) throw err;

			    var collection = db.collection(collectionName);
			    collection.insert({a:2}, function(err, docs) {
			    	if (err) throw err;  			    	

			    	if (success) {
			    		success();
			    	}
			    });
			 })

		}
	};

}();