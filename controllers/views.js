var db = require('../infrastructure/db.js'),
	queries = require('../queries.js');

module.exports = {

	init: function(app) {

		var handleResult = function(success, client, res, done, err) {
			if (err) {
				done();
				res.send(500);
			} else {
				success(client, res, done);
			}
		};

		app.get('/', function(req, res) {
			res.sendfile('views/index.html');		
		});

		app.get('/index', function(req, res) {
		  res.sendfile('views/index.html');   
		});

		app.get('/lists', function(req, res) {
			res.sendfile('views/lists.html');		
		});

		app.get('/lists/by/:userid', function(req, res) {

			db.connect(function(err, client, done) {

				handleResult(function(client, res, done) {

					var queryExecutor = new queries.QueryExecutor(client);
					var userid = req.param("userid");

					queryExecutor.execute({ type : 'consumed_lists', userid : userid }, function(err, result) {

						handleResult(function(client, res, done) {
							done();

							res.render('lists_by_userid', { model: result });
						}, client, res, done, err);

					});

				}, client, res, done, err);				
			});

		});

	}

}