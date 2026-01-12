const jwtSecret = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport.js');

let generateJWTToken = (user) => {
  return jwt.sign({ id: user._id }, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

module.exports = (router) => {
  router.post('/login', (req, res) => {
  	passport.authenticate('local', { session: false}, (error, user, info) => {
  	  if (error || !user) {
  	  	return res.status(400).json({
  	  	  message: 'Enter correct username/password.',
  	  	  user: user
  	  	});
  	  }
  	  req.login(user, { session: false }, (error) => {
  	  	if (error) {
  	  		res.send(error);
  	  	}
  	  	let token = generateJWTToken(user.toJSON());
  	  	let username = user.Username;
        let userid = user._id
  	  	return res.json({ userid, username, token });
  	  });
  	})(req, res);
  });
};