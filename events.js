module.exports = {

	ItemConsumed : function(itemId, userId, category, description, link) {

		if (!itemId) {
			throw new Error('itemId expected')
		}
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
		this.itemId = itemId;
		this.userId = userId;		
		this.category = category;		
		this.description = description;		
		this.link = link;		
		this.timestamp = new Date();

	}

};