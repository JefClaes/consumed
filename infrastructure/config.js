var config = { 
	connectionstring : process.env.DATABASE_URL || 'pg://postgres:admin@localhost:5432/test',
	twitter : {
		consumerKey: 'deleted',
    	consumerSecret: 'deleted',
    	callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
	}
};

module.exports = config;
