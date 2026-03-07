const express = require('express');
const adminController = require("../controllers/admin.controller");
const authUser = require("../middlware/auth.middleware");
const adminMiddleware = require("../middlware/admin.middleware");
const { validateMongoIdParam } = require("../middlware/validate.middleware");
const adminRoutes = express.Router();

adminRoutes.get("/users", authUser, adminMiddleware, adminController.getUsers);
adminRoutes.patch("/ban/:id", authUser, adminMiddleware, validateMongoIdParam("id"), adminController.banUser);
adminRoutes.patch("/unban/:id", authUser, adminMiddleware, validateMongoIdParam("id"), adminController.unbanUser);
adminRoutes.delete("/:id", authUser, adminMiddleware, validateMongoIdParam("id"), adminController.deleteUser);

module.exports = adminRoutes;
