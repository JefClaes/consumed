var async = require('async');

module.exports = {

	ConsumedListProjection : function(client) {

		this.run = function(eventStream, callback) {

			async.forEach(eventStream.getEvents(), function(event, callback) {

				if (event.getType() === 'ItemConsumed') {					

					var payload = event.getPayload();
					var sql = 'INSERT INTO consumed_lists (userid, description, category, link) VALUES ($1, $2, $3, $4)';
					var parameters = [ 
						payload.userId, 
						payload.description, 
						payload.category,
						payload.link ];						

					client.query(sql, parameters, function(err, result) {							
					
						if (err) {
							callback(err);
						} else {
							callback(null);
						}

					});
				}
			
			}, function(err) {

				if (err) {
					callback(err);
				} else {
					callback(null);
				}				

			});								

		}

	},

	load : function(client) {

		var projections = [];
		projections.push(new this.ConsumedListProjection(client));

		return projections;

	}

};