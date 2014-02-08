module.exports = {

	ItemConsumed : function(userId, category, description, link) {

		this.type = 'ItemConsumed';		
		this.userId = userId;		
		this.category = category;		
		this.description = description;		
		this.link = link;		

	}

};