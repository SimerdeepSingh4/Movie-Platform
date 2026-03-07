const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require("../config/cache");

function signUserToken(user) {
    return jwt.sign({
        id: user._id,
        role: user.role,
        isBanned: user.isBanned,
        name: user.username
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

async function registerController(req, res) {
    try {
        const { email, username, password } = req.body;

        const isUserExist = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (isUserExist) {
            return res.status(409).json({
                message: "User already exists" + (isUserExist.email === email ? " with this email" : "with this username")
            })
        }
        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = signUserToken(user);

        res.cookie("token", token);

        return res.status(201).json({
            message: "User created successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to register user",
            error: error.message
        });
    }
}

async function loginController(req, res) {
    try {
        const { email, username, password } = req.body;

        const user = await userModel.findOne(
            {
                $or: [
                    { email: email },
                    { username: username }
                ]
            }
        ).select("+password")
        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }
        if (user.isBanned) {
            return res.status(401).json({
                message: "User is banned"
            })
        }


        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }

        const token = signUserToken(user);

        res.cookie("token", token);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to login",
            error: error.message
        });
    }
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
}

async function logoutController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            try {
                await redis.set(token, Date.now().toString(), "EX", 24 * 60 * 60);
            } catch (error) {
            }
        }

        res.clearCookie("token");

        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to logout",
            error: error.message
        });
    }
}

module.exports = {
    registerController,
    loginController,
    getMe,
    logoutController
}
