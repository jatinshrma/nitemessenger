const jwt = require("jsonwebtoken");
require('dotenv').config();
const getProfile = (req, res, next) => {

    // DeCode user ID from JWT token and add to req obj.
    const token = req.header('Token');
    if (!token) {
        return res.status(401).json({ error: "Invalid token" })
    }
    try {
        const profile = jwt.verify(token, process.env.SECRET);
        req.user = profile.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" })
    }
}
module.exports = getProfile