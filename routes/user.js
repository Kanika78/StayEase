const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {savedRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup" , userController.renderSignupform);

router.post("/signup" , wrapAsync(userController.signup));

//login
router.get("/login" , userController.loginForm);
router.post("/login" , savedRedirectUrl, passport.authenticate('local' , {failureRedirect : "/login" , failureFlash : true}), userController.login);

//logout
router.get("/logout" , userController.logout);

module.exports = router;
