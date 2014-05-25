var async = require('async');

module.exports = {

	ConsumedListProjection : function(client) {

		this.run = function(eventStream, callback) {

			async.forEach(eventStream.getEvents(), function(event, callback) {

				var payload = event.getPayload();

				if (event.getType() === 'ItemConsumed') {					

					var sql = 'INSERT INTO consumed_lists (userid, description, category, link, timestamp, itemid) VALUES ($1, $2, $3, $4, $5, $6)';
					var parameters = [ 
						payload.userId, 
						payload.description, 
						payload.category,
						payload.link,
						payload.timestamp,
						payload.itemId ];						

					client.query(sql, parameters, function(err, result) {							

						if (err) {
							callback(err);
						} else {
							callback(null);
						}

					});
				} else if (event.getType() === 'ItemUnconsumed') {

					var sql = 'DELETE FROM consumed_lists WHERE itemid = $1';

					client.query(sql, [payload.itemId], function(err, result) {

						if (err) {
							callback(err);
						} else {
							callback(null);
						}

					});

				} else {

					callback(null);

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