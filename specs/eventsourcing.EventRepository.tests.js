var er = require('../eventsourcing.js'); 
var pg = require('pg'); 

var conString = "pg://postgres:admin@localhost:5432/test";

describe("EventRepository", function() {

	beforeEach(function(callback) {

	  pg.connect(conString, function(err, client, done) {     

        client.query('TRUNCATE TABLE events', function(err, result) {         
          
          expect(err).toEqual(null);

          done();
          callback();

        });

      });       

	});

	it("can get a stream by id", function(testDone) {
 
  		pg.connect(conString, function(err, client, done) {         

  			expect(err).toEqual(null);
          
      	var repo = new er.EventRepository(client);
      	var streamId = '2e6c13a7-cdaf-4559-8a18-a78e229587a4';
      	var payload = { 'amount' : '5' };
      	var event = new er.WriteEvent('accountDebited', payload);
      	var count = 10;
      	var events = [];

      	for (var i = 0; i < count; i++) {
        	events.push(event);          
      	}

      	var eventStream = new er.EventStream(streamId, events);                              

      	var callback = function(err, result) {
        
        	expect(err).toEqual(null);

        	repo.getEventStream(streamId, function(err, result) {

        		expect(err).toEqual(null);
        	  expect(result.getEvents().length).toEqual(count);
        	  expect(result.getStreamId()).toEqual(streamId);              		
          
            var firstEvent = result.getEvents()[0];

          	expect(firstEvent.getId()).toBeTruthy();
			      expect(firstEvent.getType()).toEqual('accountDebited');             
			      expect(JSON.stringify(firstEvent.getPayload())).toEqual(JSON.stringify(payload));      
          
          	testDone();
          	done();              

          });           
        
        };                    

        repo.createOrAppendStream(eventStream, callback);    

      });             

  	});

});

