var db = require('../infrastructure/db.js')
	, er = require('../infrastructure/eventsourcing.js')
	, ev = require('../domain/events.js')
	, express = require('express')
	, expressValidator = require('express-validator')
	, pj = require('../projections.js')
	, queries = require('../queries.js')
	, config = require('../infrastructure/config.js')
	, sys = require('../infrastructure/system.js')
	, web = require('../infrastructure/web.js');

module.exports = {
	
	init: function(app, passport) {

		var apiFilter = function() {
			return [ web.filters.ensureApiAuthenticated, web.filters.asJson ];
		};

		var createEventStore = function(client) {
			var projections = pj.load(client);	
			var store = new er.EventStore(client, projections);

			return store;
		};

		var createQueryExecutor = function(client) {
			return new queries.QueryExecutor(client);
		};

	    var extractUserId = function(req) {
	    	return req.user.provider + '-' + req.user.username;
	    };

		app.get('/queries/consumedlists', apiFilter(), function(req, res) {

			var body = function(client, done, callback) {
				var query = { type : 'consumed_lists', userid : extractUserId(req) };

				createQueryExecutor(client).execute(query, function(err, result) {
					if (err) {
						web.status.error(res)();
					} else {
						res.send(result);
					}
				});
			};

			db.inTransaction(body, web.status.ok(res), web.status.error(res));			

		});

		app.post('/commands/unconsume', apiFilter(), function(req, res) {
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
				createEventStore(client).createOrAppendStream(eventStream, function(err) {
					if (err) {
						callback(client, done, err);
					} else {
						callback(client, done, null);
					}
				});			
			};				

			db.inTransaction(body, web.status.ok(res), web.status.error(res));

		});

		app.post('/commands/consume', apiFilter(), function(req, res) {
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
				extractUserId(req), 
				req.body.category, 
				req.body.description, 
				req.body.link);
		    var event = new er.WriteEvent(payload.type, payload);
		    var eventStream = new er.EventStream('consumeditem/' + itemId, [ event ]);  
			
		    var body = function (client, done, callback) {			
				createEventStore(client).createOrAppendStream(eventStream, function(err) {
					if (err) {
						callback(client, done, err);
					} else {
						callback(client, done, null);
					}
				});
			};

			db.inTransaction(body, web.status.ok(res), web.status.error(res));

		});

	}
	
};