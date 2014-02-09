var ev = require('../events.js'); 

module.exports = {

    setUp: function (callback) {                 

        callback();

    },

    tearDown: function (callback) {                      

        callback();

    },

    when_initializing_ItemConsumed_event_without_userId_an_exception_is_thrown: function(test) {

      test.throws(function() { new ev.ItemConsumed(null, 'books', 'twilight', 'http:\/\/twilight.com'); });      
      test.done();

    },

    when_initializing_ItemConsumed_event_without_category_an_exception_is_thrown: function(test) {

      test.throws(function() { new ev.ItemConsumed(1, null, 'twilight', 'http:\/\/twilight.com'); });      
      test.done();

    },    

    when_initializing_ItemConsumed_event_without_description_an_exception_is_thrown: function(test) {

      test.throws(function() { new ev.ItemConsumed(1, 'books', null, 'http:\/\/twilight.com'); });      
      test.done();

    },

    when_initializing_ItemConsumed_event_without_link_an_exception_is_thrown: function(test) {

      test.throws(function() { new ev.ItemConsumed(1, 'books', 'twilight', null); });      
      test.done();

    }              
   
};