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

module.exports = userRoutes;
