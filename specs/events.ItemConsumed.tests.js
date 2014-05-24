var ev = require('../events.js'); 

describe("ItemConsumed event", function() {
 
    it("throws when it is initialized without itemId", function() {
 
      expect(function() {
        new ev.ItemConsumed(null, 1, 'books', 'twilight', 'http:\/\/twilight.com'); 
      }).toThrow();

    });

  	it("throws when it is initialized without userId", function() {
 
  		expect(function() {
  			new ev.ItemConsumed('1', null, 'books', 'twilight', 'http:\/\/twilight.com'); 
  		}).toThrow();

  	});

  	it("throws when it is initialized without category", function() {
 
  		expect(function() {
  			new ev.ItemConsumed('1', 1, null, 'twilight', 'http:\/\/twilight.com');
  		}).toThrow();

  	});

   	it("throws when it is initialized without description", function() {
 
  		expect(function() {
  			new ev.ItemConsumed('1', 1, 'books', null, 'http:\/\/twilight.com'); 
  		}).toThrow();

  	});

	  it("throws when it is initialized without link", function() {
 
  		expect(function() {
	  		new ev.ItemConsumed('1', 1, 'books', 'twilight', null);
  	  }).toThrow();

    });

    it("sets a timestamp", function() {
          
      var e = new ev.ItemConsumed('1', 1, 'books', 'twilight', 'http:\/\/twilight.com'); 
      expect(e).toBeTruthy();

    });
  
});