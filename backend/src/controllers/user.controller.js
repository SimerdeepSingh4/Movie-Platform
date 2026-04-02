const favoriteModel = require("../models/favorite.model");
const watchHistoryModel = require("../models/watchHistory.model");
const watchlistModel = require("../models/watchlist.model");
const userModel = require("../models/user.model");

async function addFavorite(req, res) {
    try {
        const { tmdbId, _id_custom, mediaType, source } = req.body;
        const favorite = await favoriteModel.create({
            user: req.user.id,
            tmdbId,
            _id_custom,
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
            .populate("_id_custom")
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
        const { mediaType, tmdbId } = req.params;
        const query = { user: req.user.id, mediaType };
        
        if (tmdbId.length > 10) { // Likely MongoId
            query._id_custom = tmdbId;
        } else {
            query.tmdbId = Number(tmdbId);
        }

        const deleted = await favoriteModel.findOneAndDelete(query);

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
        const { tmdbId, _id_custom, mediaType, action, source } = req.body;
        
        const query = { user: req.user.id, mediaType };
        if (_id_custom) {
            query._id_custom = _id_custom;
        } else {
            query.tmdbId = tmdbId;
        }

        // Upsert to prevent duplicates and update timestamp
        const entry = await watchHistoryModel.findOneAndUpdate(
            query,
            { 
                $set: { 
                    action: action || "opened", 
                    source: source || "tmdb" 
                } 
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        return res.status(201).json({
            message: "Watch history updated successfully",
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
            .populate("_id_custom")
            .sort({ updatedAt: -1 }) // Sort by most recently updated
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

async function removeHistoryItem(req, res) {
    try {
        const { mediaType, id } = req.params;
        const query = { user: req.user.id, mediaType };
        
        if (id.length > 10) {
            query._id_custom = id;
        } else {
            query.tmdbId = Number(id);
        }

        const deleted = await watchHistoryModel.findOneAndDelete(query);

        if (!deleted) {
            return res.status(404).json({
                message: "History item not found"
            });
        }

        return res.status(200).json({
            message: "Removed from history successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to remove from history",
            error: error.message
        });
    }
}

async function addWatchlist(req, res) {
    try {
        const { tmdbId, _id_custom, mediaType, source } = req.body;
        const entry = await watchlistModel.create({
            user: req.user.id,
            tmdbId,
            _id_custom,
            mediaType,
            source: source || 'tmdb'
        });

        return res.status(201).json({
            message: "Added to watchlist successfully",
            watchlist: entry
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Already in watchlist"
            });
        }
        return res.status(500).json({
            message: "Failed to add to watchlist",
            error: error.message
        });
    }
}

async function getWatchlist(req, res) {
    try {
        const watchlist = await watchlistModel
            .find({ user: req.user.id })
            .populate("_id_custom")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Watchlist fetched successfully",
            watchlist
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch watchlist",
            error: error.message
        });
    }
}

async function removeWatchlist(req, res) {
    try {
        const { id, type } = req.params;
        const query = { user: req.user.id, mediaType: type };
        
        if (id.length > 10) {
            query._id_custom = id;
        } else {
            query.tmdbId = Number(id);
        }

        const deleted = await watchlistModel.findOneAndDelete(query);

        if (!deleted) {
            return res.status(404).json({
                message: "Item not found in watchlist"
            });
        }

        return res.status(200).json({
            message: "Removed from watchlist successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to remove from watchlist",
            error: error.message
        });
    }
}

async function searchUsers(req, res) {
    try {
        const { query = '' } = req.query;
        
        const users = await userModel.find({
            username: { $regex: query, $options: 'i' },
            role: { $ne: 'admin' }
        })
        .select('username photoUrl _id')
        .sort({ username: 1 })
        .limit(20);

        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to search users",
            error: error.message
        });
    }
}

module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
    addWatchHistory,
    getWatchHistory,
    removeHistoryItem,
    addWatchlist,
    getWatchlist,
    removeWatchlist,
    searchUsers
};
