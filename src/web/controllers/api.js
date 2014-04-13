var util = require('util')
	, express = require('express')
	, expressValidator = require('express-validator')
	, async = require('async')
	, pg = require('pg')
	, er = require('../eventsourcing.js')
	, pj = require('../projections.js')
	, ev = require('../events.js')
	, queries = require('../queries.js')
	, config = require('../config.js');

module.exports = {
	
	init: function(app, passport) {

		var ensureApiAuthenticated = function(req, res, next) {
		  if (req.isAuthenticated()) { 
		  	return next(); 
		  }
		  
		  res.send(401);
		}

		app.get('/queries/consumedlists', ensureApiAuthenticated, function(req, res) {
			res.contentType('application/json');               

			pg.connect(config.connectionstring, function(err, client, done) {

				if (err) {
					done();
					res.send(500);
				} else {
					var queryExecutor = new queries.QueryExecutor(client);
					var userid = req.user.provider + '/' + req.user.username;
					queryExecutor.execute({ type : 'getconsumedlists', userid : userid }, function(err, result) {
						if (err) {
							done();
							res.send(500);
						} else {
							done();
							res.send(result);
						}
					});
				}

			});

		});

		app.post('/commands/consume', ensureApiAuthenticated, function(req, res) {
			res.contentType('application/json');               

			req.checkBody('description', 'Invalid description').notEmpty();
			req.checkBody('category', 'Invalid category').notEmpty();
			req.checkBody('link', 'Invalid link').notEmpty();

			console.log(req);

			var errors = req.validationErrors();
			if (errors) {
				res.send(errors, 400);		
		    	return;
			}

			var payload = new ev.ItemConsumed(req.user.provider + '/' + req.user.username, req.body.category, req.body.description, req.body.link);
		    var event = new er.WriteEvent(payload.type, payload);
		    var eventStream = new er.EventStream('consumed/' + req.user.provider + '/' + req.user.username, [ event ]);  
						
			async.waterfall([

				function(callback) {

					pg.connect(config.connectionstring, function(err, client, done) {   

						if (err) {
							callback(err, client, done);
						} else {
							callback(null, client, done);
						}

					});

				},

				function (client, done, callback) {

					client.query('BEGIN', function(err) {

						if (err) {
							callback(err, client, done);
						} else {
							callback(null, client, done);
						}

					});

				},

				function (client, done, callback) {

					var projections = pj.load(client);	
					var store = new er.EventStore(client, projections);

					store.createOrAppendStream(eventStream, function(err) {

						if (err) {
							callback(err, client, done);
						} else {
							callback(null, client, done);
						}

					});

				}], 

				function (err, client, done) {

					if (err) {

						client.query('ROLLBACK', function() {
							done();     
						 	res.send(500);		
			    		});	   

					} else {

						client.query('COMMIT', function() {
							done();     
							res.send(200, { result : 'ok' });		
			        	});			

					}	

				});


		});

	}
	
};