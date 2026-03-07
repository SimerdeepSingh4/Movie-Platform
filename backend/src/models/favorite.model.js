const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        tmdbId: {
            type: Number,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ["movie", "tv", "person"],
            required: true,
        },
        source: {
            type: String,
            enum: ["tmdb", "custom"],
            default: "tmdb",
        },
    },
    { timestamps: true }
);

favoriteSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

const favoriteModel = mongoose.model("favorites", favoriteSchema);

module.exports = favoriteModel;
