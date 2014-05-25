var passport = require('passport') 
  , config = require('../infrastructure/config.js')
	, TwitterStrategy = require('passport-twitter').Strategy;

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

module.exports = passport;