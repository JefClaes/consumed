var MongoClient = require('mongodb').MongoClient;		
var Config = require('./config.js').Config;

exports.EventStoreClient = function() {

	return {
		helloWorld : function(success) {									    

			MongoClient.connect(Config.connectionstring, function(err, db) {
			    if(err) throw err;

			    var collection = db.collection('test_insert');
			    collection.insert({a:2}, function(err, docs) {
			    	if (err) throw err;  

			    	console.log('inserted');

			    	if (success) {
			    		success();
			    	}
			    });
			 })

		}
	};

}();