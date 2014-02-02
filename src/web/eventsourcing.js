module.exports = {

	EventRepository : function(client) {

		this.createOrAppendStream = function(aggregateId, eventStream, success) {

			var events = eventStream.events();

			for (var i = 0; i < events.length; i++) {			
				
				client.query('INSERT INTO events (payload) VALUES ($1)', [ events[i].getPayload() ], function(err, result) {
					if (err) {					
						throw new Error();						
					}					
				});

				success();
			}	
		
		}

	},

	EventStream : function() {
		var events = [];

		this.add = function(event) {			
			events.push(event);
		};
		this.events = function() {		
			return events;
		};

	},

	Event : function(payload) {		

		this.getPayload = function() {
			return payload;
		};

	}

};