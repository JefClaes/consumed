var er = require('../eventsourcing.js'); 
var pg = require('pg'); 

var conString = "pg://postgres:admin@localhost:5432/test";

module.exports = {

    setUp: function (callback) {                 

      pg.connect(conString, function(err, client, done) {

        if (err) {
          throw new Error();
        }

        client.query('TRUNCATE TABLE events', function(err, result) {
          
          if (err) {
            throw new Error();
          }

          done();
          callback();

        });

      });       

    },

    tearDown: function (callback) {                     

        pg.end();
        callback();

    },  

    when_creating_a_stream_it_is_created: function (test) {                    

      pg.connect(conString, function(err, client, done) {         

          if (err) {
            throw new Error();
          }

          var repo = new er.EventRepository(client);

          var success = function() {
            test.done();                                                       
            done();                                
          };          

          var eventStream = new er.EventStream();
          var event = new er.Event({ 'name' : 'Jef Claes' });

          eventStream.add(event);

          repo.createOrAppendStream('1', eventStream, success);    

        });      
       
    }   

};