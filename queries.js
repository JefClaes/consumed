var _ = require('underscore-node');

module.exports = {

	QueryExecutor : function(client) {
	
		this.execute = function(query, callback) {

			console.log('Executing query ' + query.type);

			if (query.type === 'consumed_lists') {

				var sql = 'SELECT description, userid, category, link, to_char(timestamp, \'YYYY-MM-DD\') AS timestamp, itemid ' + 
						  'FROM consumed_lists ' + 
						  'WHERE userid = $1 ' +
						  'ORDER BY category ASC, timestamp DESC';		

				client.query(sql, [ query.userid ], function(err, queryResult) {      

					if (err) {	
						callback(err, null);
					} else {		
					
						var result = { userid : query.userid, categories: [] };
						var categoryIndex = -1;

						for (var i = 0; i < queryResult.rowCount; i++) {

							var categoryExists = _.any(result.categories, function(category) {
								return queryResult.rows[i].category === category.name;
							});

							if (!categoryExists) {
								categoryIndex++;
								result.categories.push({ name : queryResult.rows[i].category, items : [] }); 
							} 
						
							result.categories[categoryIndex].items.push({ 
									description : queryResult.rows[i].description,
									link : queryResult.rows[i].link,
									timestamp: queryResult.rows[i].timestamp,
									itemid: queryResult.rows[i].itemid
								});
						}

						callback(null, result);
						
					}						

				});


			} else {

				callback('Unable to find query of type ' + query.getType(), null);

			}

		}

	}
	
};
