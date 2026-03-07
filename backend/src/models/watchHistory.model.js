const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
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
        action: {
            type: String,
            enum: ["opened", "watchedTrailer"],
            default: "opened",
        },
        source: {
            type: String,
            enum: ["tmdb", "custom"],
            default: "tmdb",
        },
    },
    { timestamps: true }
);

watchHistorySchema.index({ user: 1, createdAt: -1 });
watchHistorySchema.index({ user: 1, tmdbId: 1, mediaType: 1, action: 1 });

const watchHistoryModel = mongoose.model("watch_histories", watchHistorySchema);

module.exports = watchHistoryModel;
