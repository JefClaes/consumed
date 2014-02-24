var util = require('util')
	, express = require('express')
	, expressValidator = require('express-validator')
	, async = require('async')
	, pg = require('pg')
	, er = require('./eventsourcing.js')
	, pj = require('./projections.js')
	, ev = require('./events.js')
	, queries = require('./queries.js')
	, config = require('./config.js')
	, passport = require('passport')
 	, TwitterStrategy = require('passport-twitter').Strategy;

var app = express();

passport.serializeUser(function(user, done) {	
  	done(null, user);
});
passport.deserializeUser(function(obj, done) {	
	done(null, obj);
});
passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
  },
  function(token, tokenSecret, profile, done) {
  	process.nextTick(function () { 
    	return done(null, profile);
    });
  }
));

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

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/index');
  });

app.get('/index', function(req, res) {
	if (req.user) {
		console.log(req.user.provider + '/' + req.user.username);
	}

	res.sendfile('index.html');		
});

app.get('/queries/consumedlists', ensureApiAuthenticated, function(req, res) {
	res.contentType('application/json');               

	pg.connect(config.connectionstring, function(err, client, done) {

		if (err) {
			done();
			res.send(500);
		} else {
			var queryExecutor = new queries.QueryExecutor(client);
			var userid = req.user.provider + '/' + req.user.username;
			queryExecutor.execute({ type : 'getconsumedlists', userid : userid } }, function(err, result) {
				if (err) {
					done();
					res.send(500);
				} else {
					done();
					res.send(result);
				}
			});
		}

	});

});

app.post('/commands/consume', ensureApiAuthenticated, function(req, res) {
	res.contentType('application/json');               

	req.checkBody('description', 'Invalid description').notEmpty();
	req.checkBody('category', 'Invalid category').notEmpty();
	req.checkBody('link', 'Invalid link').notEmpty();

	console.log(req);

	var errors = req.validationErrors();
	if (errors) {
		res.send(errors, 400);		
    	return;
	}

	var payload = new ev.ItemConsumed(req.user.provider + '/' + req.user.username, req.body.category, req.body.description, req.body.link);
    var event = new er.WriteEvent(payload.type, payload);
    var eventStream = new er.EventStream('consumed/' + req.user.provider + '/' + req.user.username, [ event ]);  
				
	async.waterfall([

		function(callback) {

			pg.connect(config.connectionstring, function(err, client, done) {   

				if (err) {
					callback(err, client, done);
				} else {
					callback(null, client, done);
				}

			});

		},

		function (client, done, callback) {

			client.query('BEGIN', function(err) {

				if (err) {
					callback(err, client, done);
				} else {
					callback(null, client, done);
				}

			});

		},

		function (client, done, callback) {

			var projections = pj.load(client);	
			var store = new er.EventStore(client, projections);

			store.createOrAppendStream(eventStream, function(err) {

				if (err) {
					callback(err, client, done);
				} else {
					callback(null, client, done);
				}

			});

		}], 

		function (err, client, done) {

			if (err) {

				console.log(err);

				client.query('ROLLBACK', function() {
					done();     
				 	res.send(500);		
	    		});	   

			} else {

				client.query('COMMIT', function() {
					done();     
					res.send(200, { result : 'ok' });		
	        	});			

			}	

		});


});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  
  res.redirect('/auth/twitter');
}

function ensureApiAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  
  res.send(401);
}

module.exports = app;

if(!module.parent) {
  	app.listen(3000);
	console.log('Listening on port 3000');
}