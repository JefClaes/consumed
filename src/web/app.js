var express = require('express');
var es = require('./eventstore.js').EventStoreClient;
var app = express();

app.configure (function(){
    app.use (express.logger({ format: ":method :url" }));        
    app.use (express.bodyParser());        
});

app.get('/index', function(req, res) {	
	res.sendfile('index.html');	

	es.helloWorld();
});

app.post('/consumecommand', function(req, res) {
	console.log('Consumed!');
	console.log(req.body);

	res.contentType('application/json');
	res.send();	
});

app.listen(3000);

console.log('Listening on port 3000');

