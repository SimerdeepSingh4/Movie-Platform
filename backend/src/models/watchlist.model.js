const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        tmdbId: {
            type: Number,
        },
        _id_custom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "movies"
        },
        mediaType: {
            type: String,
            enum: ["movie", "tv"],
            required: true
        },
        source: {
            type: String,
            enum: ["tmdb", "internal"],
            default: "tmdb"
        }
    },
    { timestamps: true }
);

// Prevent duplicate entries for the same user and content
watchlistSchema.index({ user: 1, tmdbId: 1, _id_custom: 1, mediaType: 1 }, { unique: true });

const watchlistModel = mongoose.model("watchlist", watchlistSchema);

module.exports = watchlistModel;
