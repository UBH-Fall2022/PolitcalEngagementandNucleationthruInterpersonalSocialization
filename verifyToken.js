const jwt = require('jsonwebtoken');
require("dotenv/config");
function verifyToken(req,res,next){
	if(typeof req.cookies.access_token === 'undefined' || !req.cookies.access_token || req.cookies.access_token == ''){
		req.anonymous = true;
		next();
	} else {
		req.anonymous = false;
		if(typeof req.cookies.access_token !== 'undefined'){
			jwt.verify(req.cookies.access_token,process.env.SECRET, function(err, decoded) {
				if(err){
					res.status(403).send("Invalid token");
				} else {
					req.JWTBody = decoded;
					next();
				}
			});
		} else {
			res.status(403).send(null);
		}
	}
}
module.exports = verifyToken;
