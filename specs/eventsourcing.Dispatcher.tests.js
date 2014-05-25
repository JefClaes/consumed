var er = require('../infrastructure/eventsourcing.js'); 
var pg = require('pg'); 

var conString = "pg://postgres:admin@localhost:5432/test";
var streamId = '2e6c13a7-cdaf-4559-8a18-a78e229587a4';

describe("Dispatcher", function() {

	beforeEach(function(callback) {

	 pg.connect(conString, function(err, client, done) {           

      client.query('TRUNCATE TABLE events', function(err, result) {                            

        var repo = new er.EventRepository(client);

        var event = new er.WriteEvent('accountDebited', { 'amount' : '5' });                   
        var eventStream = new er.EventStream(streamId, [ event, event ]);                                        
     
        repo.createOrAppendStream(eventStream, function(err, result) {
          
          callback();                                        
          done();                   
          
        });                      

      });

    });       

	});

	it("dispatches all events", function(testDone) {
 
    pg.connect(conString, function(err, client, done) {            

      var repo = new er.EventRepository(client);

      repo.getEventStream(streamId, function(err, result) {

        expect(err).toEqual(null);

        var dummyProjection = { 
          run : function(eventstream, callback) { 
            callback(null); 
          } 
        };

        var projections = [ dummyProjection ];
        var dispatcher = new er.Dispatcher(client, projections);          

        dispatcher.dispatch(result, function(err) {           

          expect(err).toEqual(null);

          var sql = 'SELECT id FROM events WHERE dispatched = false AND streamid = $1';
          var parameters = [ result.getStreamId() ];

          client.query(sql, parameters, function(err, result) {
             
            expect(result.rowCount).toEqual(0);
            done();
            testDone();

          });

        });

      });

    });  		

  });       

});