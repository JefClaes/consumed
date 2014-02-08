var express = require('express');
var async = require('async');
var pg = require('pg'); 
var er = require('./eventsourcing.js');
var pj = require('./projections.js');
var ev = require('./events.js');
var config = require('./config.js');

var app = express();

app.configure (function(){
    app.use (express.logger({ format: ":method :url" }));        
    app.use (express.bodyParser());        
});

app.get('/index', function(req, res) {	
	res.sendfile('index.html');		
});

app.post('/commands/consume', function(req, res) {
	res.contentType('application/json');               

	async.waterfall([

		function(callback) {

			pg.connect(config.connectionstring, function(err, client, done) {   

				if (err) {
					callback(err);
				} else {
					callback(null, client, done);
				}

			});

		},

		function (client, done, callback) {

			client.query('BEGIN', function(err) {

				if (err) {
					callback(err);
				} else {
					callback(null, client, done);
				}

			});

		},

		function(client, done, callback) {

			var repo = new er.EventRepository(client);			

			var payload = new ev.ItemConsumed('1', 'Films', 'Golden Eye', 'http://jefclaes.be');
	        var event = new er.WriteEvent(payload.type, payload);
	        var eventStream = new er.EventStream('1', [ event ]);    

	        repo.createOrAppendStream(eventStream, function(err) {

	        	if (err) {
	        		callback(err);
	        	} else {
	        		callback(null, client, done);
	        	}

	        });

		},

		function(client, done, callback) {

			var repo = new er.EventRepository(client);	

			repo.getUndispatchedEventStream('1', function(result, err) {

				if (err) {
					callback(err);
				} else {
					callback(null, result, client, done);
				}

			});

		},

		function(eventStream, client, done, callback) {

			var projections = pj.load(client); 			
			var disp = new er.Dispatcher(client, projections);

			disp.dispatch(eventStream, function(err) {

				if (err) {
					handleError(err);	
				} else {
					callback(null, client, done);
				}

			});        

		}

	], function (err, client, done) {

		if (err) {

			client.query('ROLLBACK', function() {
				done();     
			 	res.send(500);		
    		});	   

		} else {

			client.query('COMMIT', function() {
				done();     
				res.send();		
        	});			

		}	

	});
	
});

app.listen(3000);

console.log('Listening on port 3000');

