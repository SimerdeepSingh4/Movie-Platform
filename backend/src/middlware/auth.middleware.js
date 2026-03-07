const redis = require("../config/cache");
const jwt = require('jsonwebtoken');


async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        })
    }

    let isTokenBlacklisted = null;
    try {
        isTokenBlacklisted = await redis.get(token);
    } catch (error) {
        isTokenBlacklisted = null;
    }

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }

    let decoded = null;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded;
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports = authUser;
