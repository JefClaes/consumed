var Config = require('../config.js').Config;

var es;

var S4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

var guid = function() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());    
}

var publisher = {
    publish : function(event) {
        console.log(event);
    }
};

module.exports = {

    setUp: function (callback) {         

      

    },

    tearDown: function (callback) {                     
        callback();
    },  

    when_creating_a_stream_it_is_created: function (test) {       
       
       
       
    },

   /* when_adding_an_event_to_an_existing_stream_it_is_added: function (test) {       

      
       
    }*/

};