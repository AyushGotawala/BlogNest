const express = require("express");
const authRouter = express.Router();
const authController = require("../controller/authController");

authRouter.get("/SignUp",authController.getSignUp);
authRouter.post("/SignUp",authController.postSignUp);
authRouter.get("/Login",authController.getLogin);
authRouter.post("/Login",authController.postLogin);
authRouter.get("/Logout",authController.logout);

module.exports = authRouter;