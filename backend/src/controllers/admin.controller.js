const userModel = require("../models/user.model");



async function getUsers(req, res) {
    try {
        const users = await userModel
            .find({})
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
        if (req.user.id === id) {
            return res.status(400).json({
                message: "You cannot ban yourself"
            });
        }
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
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
            { returnDocument: 'after' }
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
        if (req.user.id === id) {
            return res.status(400).json({
                message: "You cannot unban yourself"
            });
        }
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
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
            { returnDocument: 'after' }
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
        if (req.user.id === id) {
            return res.status(400).json({
                message: "You cannot delete yourself"
            });
        }
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
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

async function makeAdmin(req, res) {
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
                message: "User is already an admin"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    role: "admin"
                }
            },
            { returnDocument: 'after' }
        ).select("-password");

        return res.status(200).json({
            message: "User promoted to admin successfully",
            user: updatedUser
        })

    } catch (error) {
        return res.status(500).json({
            message: "Failed to promote user to admin",
            error: error.message
        });
    }
}

async function demoteUser(req, res) {
    try {
        const { id } = req.params;
        if (req.user.id === id) {
            return res.status(400).json({
                message: "You cannot demote yourself"
            });
        }
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (user.role === "user") {
            return res.status(400).json({
                message: "User is already a standard user"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    role: "user"
                }
            },
            { returnDocument: 'after' }
        ).select("-password");

        return res.status(200).json({
            message: "Admin demoted to user successfully",
            user: updatedUser
        })

    } catch (error) {
        return res.status(500).json({
            message: "Failed to demote user",
            error: error.message
        });
    }
}


module.exports = {
    getUsers,
    banUser,
    unbanUser,
    deleteUser,
    makeAdmin,
    demoteUser
}
