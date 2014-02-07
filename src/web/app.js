var express = require('express');
var er = require('./eventsourcing.js');
var pj = require('./projections.js');
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

	pg.connect(conString, function(err, client, done) {     		

		var repo = new er.EventRepository(client);
		var projections = pj.load(); 
		var disp = new er.Dispatcher(client, projections);
		 
        var payload = { 'amount' : '5' };
        var event = new er.WriteEvent('accountDebited', payload);
        var eventStream = new er.EventStream('1', [ event ]);                      

        repo.createOrAppendStream(eventStream, function(err) {

        	if (err) {        		
                done();     

        		res.contentType('application/json');                
				res.send(500);		
        	} else {        		

        		repo.getUndispatchedEventStream('1', function(result, err) {

        			if (err) {

        				res.contentType('application/json');
						res.send(500);		

        				done();
        			} else {

        				disp.dispatch(result, function(err) {

        					if (err) {
        						done();     

        						res.contentType('application/json');
								res.send(500);		
        					} else {
        						done();     

        						res.contentType('application/json');
								res.send();		
        					}

        				});        				

        			}        			

        		});

        	}    
        });

	});	
});

app.listen(3000);

console.log('Listening on port 3000');

