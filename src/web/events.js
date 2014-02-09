module.exports = {

	ItemConsumed : function(userId, category, description, link) {

		if (!userId) {
			throw new Error('userId expected');
		}
		if (!category) {
			throw new Error('category expected');
		}
		if (!description) {
			throw new Error('description expected');
		}
		if (!link) {
			throw new Error('link expected');
		}

		this.type = 'ItemConsumed';		
		this.userId = userId;		
		this.category = category;		
		this.description = description;		
		this.link = link;		

	}

};