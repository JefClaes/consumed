module.exports = {

	_ConsumedListProjection : function(client) {

		this.run = function(eventStream, callback) {

			for (var i = 0; i < eventStream.getEvents().length; i++) {

				console.log(eventStream.getEvents()[i]);

			}

			callback();

		}

	},

	load : function(client) {

		var projections = [];
		projections.push(new this._ConsumedListProjection(client));

		return projections;

	}

};