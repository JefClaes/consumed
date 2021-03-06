var proj = require('../projections.js'); 
var pg = require('pg'); 
var ev = require('../domain/events.js');
var queries = require('../queries.js');
var es = require('../infrastructure/eventsourcing.js');

var conString = "pg://postgres:admin@localhost:5432/test";
var streamId = '2e6c13a7-cdaf-4559-8a18-a78e229587a4';

describe("Running a ConsumedListProjection", function() {

	beforeEach(function(callback) {

	  pg.connect(conString, function(err, client, done) {     

	  	expect(err).toEqual(null);

        client.query('TRUNCATE TABLE consumed_lists', function(err, result) {         

			expect(err).toEqual(null);

			var projection = new proj.ConsumedListProjection(client);

			var events = [];
			events.push(new es.WriteEvent('ItemConsumed', new ev.ItemConsumed('1', 'jef', 'movie', 'The godfather', 'http:\/\/tgf.com' )));			
			events.push(new es.WriteEvent('ItemConsumed', new ev.ItemConsumed('2', 'jef', 'book', 'Code Connected', 'http:\/\/codeconnected.com' )));
			events.push(new es.WriteEvent('ItemUnconsumed', new ev.ItemUnconsumed('1')));

			var eventStream = new es.EventStream('1', events);

			projection.run(eventStream, function(err) {

				expect(err).toEqual(null);

				done();
				callback();

          	});

        });

      });       

	});

	it("the read model can be queried later.", function(testDone) {

		pg.connect(conString, function(err, client, done) {     

			var queryExecutor = new queries.QueryExecutor(client);

			queryExecutor.execute({ type: 'consumed_lists', userid: 'jef' }, function(err, result) {

				expect(err).toEqual(null);

				expect(result.userid).toEqual('jef');
				expect(result.categories.length).toEqual(1);

				testDone();

			});

		});

	});

});
