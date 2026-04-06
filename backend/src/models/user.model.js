const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters long"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be at least 6 characters long"],
            select:false

        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        isBanned: {
            type: Boolean,
            default: false
        },
        photoUrl: {
            type: String,
            default: "https://ik.imagekit.io/dhyh95euj/6880091_v=4",
        },
    },
    { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
