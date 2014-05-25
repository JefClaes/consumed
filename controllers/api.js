var util = require('util')
	, db = require('../infrastructure/db.js')
	, er = require('../eventsourcing.js')
	, ev = require('../events.js')
	, express = require('express')
	, expressValidator = require('express-validator')
	, pj = require('../projections.js')
	, queries = require('../queries.js')
	, config = require('../config.js')
	, sys = require('../infrastructure/system.js');

module.exports = {
	
	init: function(app, passport) {

		var ensureApiAuthenticated = function(req, res, next) {	
			if (req.isAuthenticated()) { 
				return next(); 
			}

			res.send(401);
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

			db.connect(function(err, client, done) {

				handleResult(function(client, res, done) {

					var queryExecutor = new queries.QueryExecutor(client);
					var userid = req.user.provider + '/' + req.user.username;

					queryExecutor.execute({ type : 'consumed_lists', userid : userid }, function(err, result) {

						handleResult(function(client, res, done) {
							done();
							res.send(result);
						}, client, res, done, err);

					});

				}, client, res, done, err);				
			});

		});

		app.post('/commands/unconsume', ensureApiAuthenticated, function(req, res) {
			res.contentType('application/json');

			req.checkBody('itemid', 'Invalid itemid').notEmpty();

			var errors = req.validationErrors();
			if (errors) {
				res.send(errors, 400);
				return;
			}

			var itemId = req.body.itemid;
			var payload = new ev.ItemUnconsumed(itemId);
		    var event = new er.WriteEvent(payload.type, payload);
		    var eventStream = new er.EventStream('consumeditem/' + itemId, [ event ]);  

			var body = function (client, done, callback) {

				var projections = pj.load(client);	
				var store = new er.EventStore(client, projections);

				store.createOrAppendStream(eventStream, function(err) {

					if (err) {
						callback(client, done, err);
					} else {
						callback(client, done, null);
					}

				});				
				
			};				

			var success = function() {
		    	res.send(200, { result : 'ok' });
		    };

		    var fail = function() {
		    	res.send(500);		
		    };

			db.inTransaction(body, success, fail);

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

			var allowedCategories = [ 'Books', 'Podcasts', 'Audio Books', 'Movies', 'Shows', 'Papers', 'Videos' ];

			if (allowedCategories.indexOf(req.body.category) === -1) {
				res.send(errors, 400);		
		    	return;
			}

			var itemId = sys.guid();
			var payload = new ev.ItemConsumed(
				itemId,
				req.user.provider + '/' + req.user.username, 
				req.body.category, 
				req.body.description, 
				req.body.link);
		    var event = new er.WriteEvent(payload.type, payload);
		    var eventStream = new er.EventStream(
		    	'consumeditem/' + itemId, [ event ]);  
			
		    var body = function (client, done, callback) {

				var projections = pj.load(client);	
				var store = new er.EventStore(client, projections);

				store.createOrAppendStream(eventStream, function(err) {

					if (err) {
						callback(client, done, err);
					} else {
						callback(client, done, null);
					}

				});

			};

		    var success = function() {
		    	res.send(200, { result : 'ok' });
		    };

		    var fail = function() {
		    	res.send(500);		
		    };

			db.inTransaction(body, success, fail);

		});

	}
	
};