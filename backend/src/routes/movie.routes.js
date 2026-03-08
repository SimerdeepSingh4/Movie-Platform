const express = require("express");
const movieRoutes = express.Router();
const movieController = require("../controllers/movie.controller");
const authUser = require("../middlware/auth.middleware");
const adminMiddleware = require("../middlware/admin.middleware");
const { validateMoviePayload, validateMongoIdParam } = require("../middlware/validate.middleware");

movieRoutes.get("/", movieController.getMovies);
movieRoutes.get("/:id", validateMongoIdParam("id"), movieController.getMovieById);
movieRoutes.post("/", authUser, adminMiddleware, validateMoviePayload, movieController.addMovie);
movieRoutes.delete("/:id", authUser, adminMiddleware, validateMongoIdParam("id"), movieController.deleteMovies);
movieRoutes.patch("/:id", authUser, adminMiddleware, validateMongoIdParam("id"), validateMoviePayload, movieController.updateMovies);


module.exports = movieRoutes;
