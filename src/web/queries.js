var _ = require('underscore-node');

module.exports = {

	QueryExecutor : function(client) {
	
		this.execute = function(query, callback) {

			if (query.type === 'getconsumedlists') {

				var sql = 'SELECT id, description, userid, category, link, timestamp FROM consumed_lists ORDER BY category ASC';		

				client.query(sql, [], function(err, queryResult) {      

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
									id : queryResult.rows[i].id, 
									description : queryResult.rows[i].description,
									link : queryResult.rows[i].link,
									timestamp: queryResult.rows[i].timestamp
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
