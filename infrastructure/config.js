var config = { 
	connectionstring : process.env.DATABASE_URL || 'pg://postgres:admin@localhost:5432/test',
	twitter : {
		consumerKey: 'nyouNGuN5MQnh6YOx7Uw',
    	consumerSecret: 'vPMY1DrnE4x3PYLYobxWZawHsv1iQwmxi6qpg6woUio',
    	callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
	}
};

module.exports = config;