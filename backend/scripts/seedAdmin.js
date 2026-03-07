require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectToDB = require("../src/config/database");
const userModel = require("../src/models/user.model");

async function seedAdmin() {
    const adminExists = await userModel.findOne({ role: "admin" });
    if (adminExists) {
        console.log("Admin already exists.");
        return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@moviedb.com";
    const adminUsername = process.env.ADMIN_USERNAME || "Admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hash = await bcrypt.hash(adminPassword, 10);

    await userModel.create({
        email: adminEmail,
        username: adminUsername,
        password: hash,
        role: "admin",
        isBanned: false
    });
    console.log("Admin created.");
}

async function run() {
    try {
        await connectToDB();
        await seedAdmin();
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed admin:", error.message);
        try {
            await mongoose.disconnect();
        } catch (e) {
        }
        process.exit(1);
    }
}

run();
