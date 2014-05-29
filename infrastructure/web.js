var web = {
	filters : {
		
		asJson : function(req, res, next) {
			res.contentType('application/json');

			return next();
		},

		ensureApiAuthenticated : function(req, res, next) {	
			if (req.isAuthenticated()) { 
				return next(); 
			}

			res.send(401);
		}

	},

	status : {

		ok : function(res) {
			return function() {
	    		res.send(200, { result : 'ok' });
	    	}
	    },

	    error : function(res) {
	    	return function() {
	    		res.send(500);		
	    	}
	    }

	}

};

module.exports = web;