const mongoose = require("mongoose");

function badRequest(res, message) {
    return res.status(400).json({ message });
}

function validateRegister(req, res, next) {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return badRequest(res, "email, username and password are required");
    }
    if (typeof email !== "string" || typeof username !== "string" || typeof password !== "string") {
        return badRequest(res, "email, username and password must be strings");
    }
    next();
}

function validateLogin(req, res, next) {
    const { email, username, password } = req.body;
    if (!password || (!email && !username)) {
        return badRequest(res, "password and either email or username are required");
    }
    next();
}

function validateMoviePayload(req, res, next) {
    const { title, releaseDate } = req.body;
    if (!title || !releaseDate) {
        return badRequest(res, "title and releaseDate are required");
    }
    next();
}

function validateFavoritePayload(req, res, next) {
    const { tmdbId, mediaType } = req.body;
    if (tmdbId === undefined || !mediaType) {
        return badRequest(res, "tmdbId and mediaType are required");
    }
    if (!["movie", "tv", "person"].includes(mediaType)) {
        return badRequest(res, "mediaType must be one of: movie, tv, person");
    }
    next();
}

function validateHistoryPayload(req, res, next) {
    const { tmdbId, mediaType, action } = req.body;
    if (tmdbId === undefined || !mediaType) {
        return badRequest(res, "tmdbId and mediaType are required");
    }
    if (action && !["opened", "watchedTrailer"].includes(action)) {
        return badRequest(res, "action must be one of: opened, watchedTrailer");
    }
    next();
}

function validateFavoriteParams(req, res, next) {
    const { tmdbId, mediaType } = req.params;
    if (!tmdbId || Number.isNaN(Number(tmdbId))) {
        return badRequest(res, "tmdbId param must be a valid number");
    }
    if (!["movie", "tv", "person"].includes(mediaType)) {
        return badRequest(res, "mediaType param must be one of: movie, tv, person");
    }
    next();
}

function validateMongoIdParam(paramName) {
    return function validateMongoId(req, res, next) {
        const value = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return badRequest(res, `${paramName} must be a valid mongo id`);
        }
        next();
    };
}

module.exports = {
    validateRegister,
    validateLogin,
    validateMoviePayload,
    validateFavoritePayload,
    validateHistoryPayload,
    validateFavoriteParams,
    validateMongoIdParam
};
