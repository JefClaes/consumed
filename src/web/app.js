var express = require('express');
var er = require('./eventsourcing.js');
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
		 
        var payload = { 'amount' : '5' };
        var event = new er.WriteEvent('accountDebited', payload);
        var eventStream = new er.EventStream('1', [ event ]);                      

        repo.createOrAppendStream(eventStream, function(err) {

        	if (err) {        		
                done();     

        		res.contentType('application/json');                
				res.send();		
        	} else {
        		
        		for (var i = 0; i < eventStream.events().length; i++) {
        			console.log(eventStream.events()[i]);
        		}

                done();     

        		res.contentType('application/json');
				res.send();		
        	}    
        });

	});	
});

app.listen(3000);

console.log('Listening on port 3000');

