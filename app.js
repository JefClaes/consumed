var express = require('express')
	, expressValidator = require('express-validator')
	, passport = require('./infrastructure/passport.bootstrapper.js')
	, authenticationController = require('./controllers/authentication.js')
	, apiController = require('./controllers/api.js')
	, viewController = require('./controllers/views.js');

var app = express();

app.configure (function(){
	app.use(express.static("static", __dirname + '/static'));
    app.use(express.logger({ format: ":method :url" }));        
    app.use(express.bodyParser());        
    app.use(expressValidator()); 
    app.use(express.cookieParser());
    app.use(express.session({ secret : 'axfdsjkqmfjkmaerauizpruzpajfx' }));
    app.use(passport.initialize());
    app.use(passport.session());
});

authenticationController.init(app, passport);
apiController.init(app, passport);
viewController.init(app);

module.exports = app;

if(!module.parent) {
	var port = Number(process.env.PORT || 5000);
  	app.listen(port);
	console.log('Listening on port ' + port);
}