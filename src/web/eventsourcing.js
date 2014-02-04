var async = require('async');

module.exports = {

	WriteEventStream : function(streamId, events) {
		this.getStreamId = function() {
			return streamId;
		};		
		this.getEvents = function() {		
			return events;
		};
	},

	ReadEventStream : function(streamId, events) {
		this.getStreamId = function() {
			return streamId;
		};		
		this.getEvents = function() {		
			return events;
		};
	},

	WriteEvent : function(type, payload) {		
		this.getType = function() {
			return type;
		};
		this.getPayload = function() {
			return payload;
		};
	},

	ReadEvent : function(type, payload) {		
		this.getType = function() {
			return type;
		};
		this.getPayload = function() {
			return payload;
		};
	},

	EventRepository : function(client) {

		this.createOrAppendStream = function(writeEventStream, callback) {  

			var events = writeEventStream.getEvents();
			var sql = 'INSERT INTO events (streamid, type, payload) VALUES ($1, $2, $3)';

			async.forEach(events, function(item, callback) {

				var parameters = [ writeEventStream.getStreamId(), item.getType(), item.getPayload() ];						

				client.query(sql, parameters, function(err, result) {							
					if (err) {
						callback(err);
					} else {					
						callback(null);
					}		
				});		

			}, function(err) {

				if (err) {
					callback(err);
				} else {
					callback(null);
				}				

			});									
		
		},

		this.getEventStream = function(streamId, callback) {

			var sql = 'SELECT type, payload FROM events WHERE streamid = $1';		
			var parameters = [ streamId ];			

			client.query(sql, parameters, function(err, result) {

				if (err) {				
					callback(err, null);
				} else {				

					var events = [];

					for (var i = 0; i < result.rowCount; i++) {															

						var row = result.rows[i];		
						events.push(new module.exports.ReadEvent(row.type, row.payload));

					}

					callback(null, new module.exports.ReadEventStream(streamId, events));
				}						

			});

		}

	}	

};