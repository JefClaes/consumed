var util = require('util')
	, async = require('async')
	, er = require('../eventsourcing.js')
	, ev = require('../events.js')
	, express = require('express')
	, expressValidator = require('express-validator')
	, pg = require('pg')
	, pj = require('../projections.js')
	, queries = require('../queries.js')
	, config = require('../config.js');

module.exports = {
	
	init: function(app, passport) {

		var ensureApiAuthenticated = function(req, res, next) {	
			if (req.isAuthenticated()) { 
				return next(); 
			}

			res.send(401);
		};

		var connect = function(callback) {
			pg.connect(config.connectionstring, function(err, client, done) {  
				if (err) {
					callback(err, client, done);
				} else {
					callback(null, client, done);
				}
			});
		};

		var inTransaction = function(body, success, fail) {

			var begin = function (client, done, callback) {
				client.query('BEGIN', function(err) {
					if (err) {
						callback(err, client, done);
					} else {
						callback(null, client, done);
					}
				});
			};

			var done = function (err, client, done) {
				if (err) {
					client.query('ROLLBACK', function() {
						done();     
						fail();
		    		});	   
				} else {
					client.query('COMMIT', function() {
						done();     
						success();
		        	});		
				}	
			};

			async.waterfall([connect, begin, body], done);

		};

		var handleResult = function(success, client, res, done, err) {
			if (err) {
				done();
				res.send(500);
			} else {
				success(client, res, done);
			}
		};

		app.get('/queries/consumedlists', ensureApiAuthenticated, function(req, res) {
			res.contentType('application/json');               

			connect(function(err, client, done) {

				handleResult(function(client, res, done) {

					var queryExecutor = new queries.QueryExecutor(client);
					var userid = req.user.provider + '/' + req.user.username;

					queryExecutor.execute({ type : 'getconsumedlists', userid : userid }, function(err, result) {

						handleResult(function(client, res, done) {
							done();
							res.send(result);
						}, client, res, done, err);

					});

				}, client, res, done, err);				
			});

		});

		app.post('/commands/consume', ensureApiAuthenticated, function(req, res) {
			res.contentType('application/json');               

			req.checkBody('description', 'Invalid description').notEmpty();
			req.checkBody('category', 'Invalid category').notEmpty();
			req.checkBody('link', 'Invalid link').notEmpty();

			var errors = req.validationErrors();
			if (errors) {
				res.send(errors, 400);		
		    	return;
			}

			var payload = new ev.ItemConsumed(req.user.provider + '/' + req.user.username, req.body.category, req.body.description, req.body.link);
		    var event = new er.WriteEvent(payload.type, payload);
		    var eventStream = new er.EventStream('consumed/' + req.user.provider + '/' + req.user.username, [ event ]);  
			
		    var body = function (client, done, callback) {

				var projections = pj.load(client);	
				var store = new er.EventStore(client, projections);

				store.createOrAppendStream(eventStream, function(err) {

					if (err) {
						callback(err, client, done);
					} else {
						callback(null, client, done);
					}

				});

			};

		    var success = function() {
		    	res.send(200, { result : 'ok' });
		    };

		    var fail = function() {
		    	res.send(500);		
		    };

			inTransaction(body, success, fail);

		});

	}
	
};