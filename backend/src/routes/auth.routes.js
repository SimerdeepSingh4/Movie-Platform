const express = require('express');
const authRoutes = express.Router();
const authController = require("../controllers/auth.controller")
const authUser = require("../middlware/auth.middleware");
const { validateRegister, validateLogin } = require("../middlware/validate.middleware");

authRoutes.post('/register', validateRegister, authController.registerController )
authRoutes.post('/login', validateLogin, authController.loginController )
authRoutes.get('/get-me', authUser, authController.getMe)
authRoutes.get('/logout',authUser,authController.logoutController )


module.exports = authRoutes;
