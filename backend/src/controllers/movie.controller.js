const movieModel = require("../models/movie.model");

async function addMovie(req, res) {
    try {
        const { title, description, releaseDate, trailerUrl, genre, tmdbId, category, posterUrl } = req.body

        const isMovieExist = await movieModel.findOne({
            $or: [
                { title },
                ...(tmdbId ? [{ tmdbId }] : [])
            ]
        })

        if (isMovieExist) {
            return res.status(409).json({
                message: "Movie already exists"
            })
        }

        const movie = await movieModel.create({
            title,
            description,
            releaseDate,
            trailerUrl,
            genre,
            tmdbId,
            category,
            posterUrl,
            createdBy: req.user.id
        })

        return res.status(201).json({
            message: "Movie added successfully",
            movie
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update movie",
            error: error.message
        });
    }
}

async function getMovies(req, res) {
    try {
        const movies = await movieModel
            .find()
            .populate("createdBy", "username email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Movies fetched successfully",
            movies
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch movies",
            error: error.message
        });
    }
}

async function getMovieById(req, res) {
    try {
        const movie = await movieModel.findById(req.params.id).populate("createdBy", "username email role");
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }
        return res.status(200).json({
            message: "Movie fetched successfully",
            movie
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch movie",
            error: error.message
        });
    }
}
async function deleteMovies(req, res) {
    try {
        const movie = await movieModel.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        return res.status(200).json({
            message: "Movie deleted successfully",
            movie
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete movie",
            error: error.message
        });
    }
}
async function updateMovies(req, res) {
    try {
        const { id } = req.params;
        const { title, description, releaseDate, trailerUrl, genre, tmdbId, category, posterUrl } = req.body

        const movie = await movieModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
                    releaseDate,
                    trailerUrl,
                    genre,
                    tmdbId,
                    category,
                    posterUrl,
                    createdBy: req.user.id
                }
            },
            { new: true }
        );
        if (!movie) {
            return res.status(404).json({
                message: "Movie don't exists"
            })
        }

        return res.status(200).json({
            message: "Movie updated successfully",
            movie
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add movie",
            error: error.message
        });
    }
}

module.exports = {
    addMovie,
    getMovies,
    getMovieById,
    deleteMovies,
    updateMovies
}
