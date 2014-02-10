describe("ItemConsumed event", function() {
 
  	it("throws when it is initialized without userId", function() {
 
  		expect(function() {
  			new ev.ItemConsumed(null, 'books', 'twilight', 'http:\/\/twilight.com'); 
  		}).toThrow();

  	});

  	it("throws when it is initialized without category", function() {
 
  		expect(function() {
  			new ev.ItemConsumed(1, null, 'twilight', 'http:\/\/twilight.com');
  		}).toThrow();

  	});

   	it("throws when it is initialized without description", function() {
 
  		expect(function() {
  			new ev.ItemConsumed(1, 'books', null, 'http:\/\/twilight.com'); 
  		}).toThrow();

  	});

	it("throws when it is initialized without link", function() {
 
  		expect(function() {
	  		new ev.ItemConsumed(1, 'books', 'twilight', null);
  		}).toThrow();

	});  
  
});