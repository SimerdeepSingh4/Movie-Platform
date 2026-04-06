const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            required: true,
        },
        description: {
            type: String,
            default: "Description not available",
            required: true,
        },
        releaseDate: {
            type: Date,
            required: true,
        },
        trailerUrl: {
            type: String,
            default: "Trailer not available",
        },
        genre: {
            type: String,
            enum: ["Action", "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi"]
        },
        tmdbId:
        {
            type: Number,
            unique: true,
            sparse: true
        },

        category: {
            type: String,
            enum: ["Movie", "TV", "Anime", "Documentary"]
        },
        createdBy:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        posterUrl: {
            type: String,
            default: "https://ik.imagekit.io/dhyh95euj/notfound_portrait.jpg",
        },
        backdropUrl: {
            type: String,
            default: "https://ik.imagekit.io/dhyh95euj/notfound_landscape.jpg",
        },
        directedBy: String,
        country: String,
        language: String,
        ageRating: String,
        runtime: Number,
        status: String,
        network: String,
        type: String,
        totalEpisodes: Number,
        totalSeasons: Number,
        watchProviders: [
            {
                id: Number,
                name: String,
                logo_path: String,
            }
        ],
        cast: [
            {
                id: Number,
                name: String,
                profile_path: String,
            }
        ],
    },
    { timestamps: true }
);

const movieModel = mongoose.model("movies", movieSchema);

module.exports = movieModel;
