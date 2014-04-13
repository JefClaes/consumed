var async = require('async');

module.exports = {

	EventStream : function(streamId, events) {		

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

	ReadEvent : function(id, type, payload) {		

		this.getId = function() {
			return id;
		};
		this.getType = function() {
			return type;
		};
		this.getPayload = function() {
			return payload;
		};

	},

	EventRepository : function(client) {

		this.createOrAppendStream = function(eventStream, callback) {
  
			var events = eventStream.getEvents();
			var sql = 'INSERT INTO events (streamId, type, payload, dispatched) VALUES ($1, $2, $3, false)';

			async.forEach(events, function(item, callback) {

				var parameters = [ eventStream.getStreamId(), item.getType(), item.getPayload() ];						

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

			var sql = 'SELECT id, type, payload FROM events WHERE streamid = $1';		
			var parameters = [ streamId ];			

			client.query(sql, parameters, function(err, result) {      

				if (err) {				
					callback(err, null);
				} else {				

					var events = [];

					for (var i = 0; i < result.rowCount; i++) {															

						var row = result.rows[i];		
						events.push(new module.exports.ReadEvent(row.id, row.type, row.payload));

					}

					var eventStream = new module.exports.EventStream(streamId, events);

					callback(null, eventStream);
				}						

			});

		},

		this.getUndispatchedEventStream = function(streamId, callback) {

			var sql = 'SELECT id, type, payload FROM events WHERE streamid = $1 AND dispatched = false';		
			var parameters = [ streamId ];			

			client.query(sql, parameters, function(err, result) {

				if (err) {				
					callback(err, null);
				} else {				

					var events = [];

					for (var i = 0; i < result.rowCount; i++) {															

						var row = result.rows[i];		
						events.push(new module.exports.ReadEvent(row.id, row.type, row.payload));

					}

					var eventStream = new module.exports.EventStream(streamId, events);

					callback(null, eventStream);
				}						

			});

		}

	},

	Dispatcher : function(client, projections) {
	
		this.dispatch = function(eventStream, callback) {

			async.forEach(projections, function(projection, callback) {

				projection.run(eventStream, function(err) {

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

					async.forEach(eventStream.getEvents(), function(event, callback) {

						var sql = "UPDATE events SET dispatched = true WHERE id = $1";
						var parameters = [ event.getId() ];

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
		
				}			

			});			

		}

	},

	EventStore : function(client, projections) {

		this.createOrAppendStream  = function(eventStream, callback) {

			async.waterfall([				

				function(waterFallCallback) {

					var repo = new module.exports.EventRepository(client);			

			        repo.createOrAppendStream(eventStream, function(err) {

			        	if (err) {
			        		waterFallCallback(err, client, callback);
			        	} else {
			        		waterFallCallback(null, client, callback);
			        	}

			        });

				},

				function(client, callback, waterFallCallback) {

					var repo = new module.exports.EventRepository(client);	

					repo.getUndispatchedEventStream(eventStream.getStreamId(), function(err, result) {

						if (err) {
							waterFallCallback(err, client, callback);
						} else {
							waterFallCallback(null, result, client, callback);
						}

					});

				},

				function(eventStream, client, callback, waterFallCallback) {

					var disp = new module.exports.Dispatcher(client, projections);

					disp.dispatch(eventStream, function(err) {

						if (err) {
							waterFallCallback(err, client, callback);	
						} else {
							waterFallCallback(null, client, callback);
						}

					});        

				}

			], function (err, client, callback) {

				if (err) {
					callback(err);
				} else {
					callback(null);
				}	

			});
		
		}

	} 

};