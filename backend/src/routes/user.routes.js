const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/user.controller");
const authUser = require("../middlware/auth.middleware");
const {
    validateFavoritePayload,
    validateHistoryPayload,
    validateFavoriteParams
} = require("../middlware/validate.middleware");

userRoutes.get("/favorites", authUser, userController.getFavorites);
userRoutes.post("/favorites", authUser, validateFavoritePayload, userController.addFavorite);
userRoutes.delete("/favorites/:mediaType/:tmdbId", authUser, validateFavoriteParams, userController.removeFavorite);

userRoutes.get("/history", authUser, userController.getWatchHistory);
userRoutes.post("/history", authUser, validateHistoryPayload, userController.addWatchHistory);
userRoutes.delete("/history/:mediaType/:id", authUser, userController.removeHistoryItem);

userRoutes.get("/watchlist", authUser, userController.getWatchlist);
userRoutes.post("/watchlist", authUser, userController.addWatchlist);
userRoutes.delete("/watchlist/:type/:id", authUser, userController.removeWatchlist);
userRoutes.get("/search", authUser, userController.searchUsers);

module.exports = userRoutes;
