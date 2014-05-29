var async = require('async')
	, pg = require('pg')
	, config = require('../infrastructure/config.js');

module.exports = {
	
	connect : function(callback) {
		pg.connect(config.connectionstring, function(err, client, done) {  
			if (err) {
				callback(err, client, done);
			} else {
				callback(null, client, done);
			}
		});
	},

	inTransaction : function(body, success, fail) {

		var connect = function(callback) {
			pg.connect(config.connectionstring, function(err, client, done) {  
				if (err) {
					callback(err, client, done);
				} else {
					console.log('Connected to ' + config.connectionstring);
					callback(null, client, done);
				}
			});
		};

		var begin = function (client, done, callback) {
			client.query('BEGIN', function(err) {
				if (err) {
					callback(err, client, done);
				} else {
					console.log('BEGIN');
					callback(null, client, done);
				}
			});
		};

		var done = function (client, done, err) {
			if (err) {
				client.query('ROLLBACK', function() {
					console.log('Error: ' + err);
					console.log('ROLLBACK');
					done();     
					fail();
	    		});	   
			} else {
				client.query('COMMIT', function() {
					console.log('COMMIT');
					done();     
					success();
	        	});		
			}	
		};

		async.waterfall([connect, begin, body], done);

	}

};