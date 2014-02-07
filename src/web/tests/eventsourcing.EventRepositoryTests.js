var er = require('../eventsourcing.js'); 
var pg = require('pg'); 

var conString = "pg://postgres:admin@localhost:5432/test";

module.exports = {

    setUp: function (callback) {                 

      pg.connect(conString, function(err, client, done) {     

        client.query('TRUNCATE TABLE events', function(err, result) {         
          
          done();
          callback();

        });

      });       

    },

    tearDown: function (callback) {                     

        callback();

    },  

    when_creating_or_appending_to_a_stream_i_can_get_it_later : function (test) {                    

      pg.connect(conString, function(err, client, done) {         

          test.equal(err, null);

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
            
            test.equal(err, null);

            repo.getEventStream(streamId, function(err, result) {

              test.equal(err, null);
              test.equal(result.getEvents().length, count);                                                                        
              test.equal(result.getStreamId(), streamId);
              
              var firstEvent = result.getEvents()[0];

              test.ok(firstEvent.getId());
              test.equal(firstEvent.getType(), 'accountDebited');              
              test.equal(JSON.stringify(firstEvent.getPayload()), JSON.stringify(payload));              

              test.done();                                                       
              done();              

            });           
            
          };                    

          repo.createOrAppendStream(eventStream, callback);    

        });      
       
    }
   
};