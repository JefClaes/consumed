var express = require('express');
var er = require('./eventsourcing.js');
var pj = require('./projections.js');
var ev = require('./events.js');
var pg = require('pg'); 

var app = express();

app.configure (function(){
    app.use (express.logger({ format: ":method :url" }));        
    app.use (express.bodyParser());        
});

app.get('/index', function(req, res) {	
	res.sendfile('index.html');		
});

app.post('/commands/consume', function(req, res) {
	var conString = "pg://postgres:admin@localhost:5432/test";
	res.contentType('application/json');               

	pg.connect(conString, function(err, client, done) {     		

		client.query('BEGIN', function(err) {

			var repo = new er.EventRepository(client);
			var projections = pj.load(client); 
			var disp = new er.Dispatcher(client, projections);
			 
	        var payload = new ev.ItemConsumed('1', 'Films', 'Golden Eye', 'http://jefclaes.be');
	        var event = new er.WriteEvent(payload.type, payload);
	        var eventStream = new er.EventStream('1', [ event ]);                      

	        var handleError = function(err) {
        		client.query('ROLLBACK', function() {
        			console.log(err);

        			done();     

				 	res.send(500);		
        		});	   
	        };

	        var commit = function() {
	        	client.query('COMMIT', function() {
					done();     
					res.send();		
	        	});				
	        };

	        repo.createOrAppendStream(eventStream, function(err) {

	        	if (err) {        		
	        		handleError(err);
	        	} else {        		

	        		repo.getUndispatchedEventStream('1', function(result, err) {

	        			if (err) {
							handleError(err);
	        			} else {

	        				disp.dispatch(result, function(err) {

	        					if (err) {
	        						handleError(err);	
	        					} else {
	        						commit();
	        					}

	        				});        				

	        			}        			

	        		});

	        	}    
	        });

		});		

	});	
});

app.listen(3000);

console.log('Listening on port 3000');

