module.exports = {

	QueryExecutor : function(client) {
	
		this.execute = function(query, callback) {

			if (query.type === 'getconsumedlists') {

				var sql = 'SELECT id, description, userid, category, link FROM consumed_lists';		

				client.query(sql, [], function(err, queryResult) {      

					if (err) {	
						callback(err, null);
					} else {		
					
						var result = { userid : query.userid };

						for (var i = 0; i < queryResult.rowCount; i++) {
							if (!result.hasOwnProperty(queryResult.rows[i].category)) {
								result[queryResult.rows[i].category] = { items : [] };
							} else {
								result[queryResult.rows[i].category].items.push({ 
									id : queryResult.rows[i].id, 
									description : queryResult.rows[i].description,
									category : queryResult.rows[i].category  
								})
							}
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
