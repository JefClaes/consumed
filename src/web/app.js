var express = require('express');
var app = express();

app.configure (function(){
    app.use (express.logger({ format: ":method :url" }));        
});

app.get('/index', function(req, res) {	
	res.sendfile('index.html');
});

app.post('/consumecommand', function(req, res) {
	console.log('Consumed!');

	res.contentType('application/json');
	res.send();	
});

app.listen(3000);

console.log('Listening on port 3000');

