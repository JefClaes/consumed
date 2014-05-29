var fs = require('fs'),
    readline = require('readline'),
    sys = require('../infrastructure/system.js');

var rd = readline.createInterface({
    input: fs.createReadStream('../README.md'),
    output: process.stdout,
    terminal: false
});

var category = '';
var description = '';
var link = '';

rd.on('line', function(line) {
	if (line.lastIndexOf('#', 0) === 0) {
		category = line.substring(2);
	}
	if (line.lastIndexOf('-', 0) === 0) {
		description = line.substring(2, line.indexOf('('));
		var linkAlmostReady = line.substring(line.indexOf('(') + 1);
		link = linkAlmostReady.substring(0, linkAlmostReady.length - 1);

		var itemId = sys.guid();

		console.log("$.ajax({ type: 'POST', url: '/commands/consume', data: { 'category' : '" + category + "', 'description' : '" +  description + "', 'link' : '" + link + "'}, dataType: 'json' }); ");
	}
});