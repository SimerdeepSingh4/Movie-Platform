const userModel = require("../models/user.model");



async function getUsers(req, res) {
    try {
        const users = await userModel
            .find({ role: "user" })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
}

async function banUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin cannot be modified"
            });
        }
        if (user.isBanned) {
            return res.status(400).json({
                message: "User is already banned"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isBanned: true
                }
            },
            { new: true }
        );
        return res.status(200).json({
            message: "User banned successfully",
            user: updatedUser
        })


    } catch (error) {
        return res.status(500).json({
            message: "Failed to ban user",
            error: error.message
        });
    }
}

async function unbanUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin cannot be modified"
            });
        }
        if (!user.isBanned) {
            return res.status(400).json({
                message: "User is already unbanned"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isBanned: false
                }
            },
            { new: true }
        );
        return res.status(200).json({
            message: "User unbanned successfully",
            user: updatedUser
        })


    } catch (error) {
        return res.status(500).json({
            message: "Failed to unban  user",
            error: error.message
        });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (user.role === "admin") {
            return res.status(400).json({
                message: "Admin cannot be Deleted"
            });
        }
        await user.deleteOne();

        return res.status(200).json({
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
}


module.exports = {
    getUsers,
    banUser,
    unbanUser,
    deleteUser
}
