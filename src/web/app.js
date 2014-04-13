var util = require('util')
	, express = require('express')
	, expressValidator = require('express-validator')
	, passport = require('./infrastructure/passport.bootstrapper.js')
	, authenticationController = require('./controllers/authentication.js')
	, apiController = require('./controllers/api.js');

var app = express();

app.configure (function(){
	app.use(express.static("static", __dirname + '/static'));
    app.use(express.logger({ format: ":method :url" }));        
    app.use(express.bodyParser());        
    app.use(expressValidator()); 
    app.use(express.cookieParser());
    app.use(express.session({ secret : 'changeit' }));
    app.use(passport.initialize());
    app.use(passport.session());
});

authenticationController.init(app, passport);
apiController.init(app, passport);

app.get('/index', function(req, res) {
	res.sendfile('index.html');		
});

app.get('/lists', function(req, res) {
	res.sendfile('lists.html');		
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  
  res.redirect('/auth/twitter');
}

module.exports = app;

if(!module.parent) {
  	app.listen(3000);
	console.log('Listening on port 3000');
}