module.exports = {
	
	init: function(app, passport) {

		app.get('/auth/twitter', passport.authenticate('twitter'));

		app.get('/auth/twitter/callback', 
		  passport.authenticate('twitter', { failureRedirect: '/login' }),
		  function(req, res) {
		    res.redirect('/lists');
		});

	}
	
};