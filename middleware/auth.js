const jwt = require('jsonwebtoken');
const config = require('config');




const tokenMatch = (req, res, next) => {


    //get token from header
    const token = req.header('x-auth-token')
    //check if not token
    if (!token) {
        return res.status(501).json({ msg: 'no token, authorizations denied' });
    }

    try {
        const verifiedToken = jwt.verify(token, config.get('jwtSecret'));
        req.user = verifiedToken.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" })
    }


}


module.exports = tokenMatch;