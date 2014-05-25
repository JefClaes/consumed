module.exports = {

	init: function(app) {

		app.get('/', function(req, res) {
			res.sendfile('views/index.html');		
		});

		app.get('/index', function(req, res) {
		  res.sendfile('views/index.html');   
		});

		app.get('/lists', function(req, res) {
			res.sendfile('views/lists.html');		
		});

		app.get('/lists/by/:userId', function(req, res) {
			res.send("userId is set to " + req.param("userId"));
		});

	}

}