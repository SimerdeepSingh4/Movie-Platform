const favoriteModel = require("../models/favorite.model");
const watchHistoryModel = require("../models/watchHistory.model");

async function addFavorite(req, res) {
    try {
        const { tmdbId, mediaType, source } = req.body;
        const favorite = await favoriteModel.create({
            user: req.user.id,
            tmdbId,
            mediaType,
            source
        });

        return res.status(201).json({
            message: "Favorite added successfully",
            favorite
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Already in favorites"
            });
        }
        return res.status(500).json({
            message: "Failed to add favorite",
            error: error.message
        });
    }
}

async function getFavorites(req, res) {
    try {
        const favorites = await favoriteModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Favorites fetched successfully",
            favorites
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch favorites",
            error: error.message
        });
    }
}

async function removeFavorite(req, res) {
    try {
        const deleted = await favoriteModel.findOneAndDelete({
            user: req.user.id,
            tmdbId: Number(req.params.tmdbId),
            mediaType: req.params.mediaType
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Favorite not found"
            });
        }

        return res.status(200).json({
            message: "Favorite removed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to remove favorite",
            error: error.message
        });
    }
}

async function addWatchHistory(req, res) {
    try {
        const { tmdbId, mediaType, action, source } = req.body;
        const entry = await watchHistoryModel.create({
            user: req.user.id,
            tmdbId,
            mediaType,
            action,
            source
        });

        return res.status(201).json({
            message: "Watch history saved successfully",
            history: entry
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to save watch history",
            error: error.message
        });
    }
}

async function getWatchHistory(req, res) {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const history = await watchHistoryModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            message: "Watch history fetched successfully",
            history
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch watch history",
            error: error.message
        });
    }
}

module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
    addWatchHistory,
    getWatchHistory
};
