const express = require("express");
const router = express.Router();
const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const usersController = require("../controllers/users.js");

// Signup
router
    .route("/signup")
    .get(usersController.renderSignupForm)
    .post(wrapAsync(usersController.signup));

// Login
router
    .route("/login")
    .get(usersController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        usersController.login
    );

// Logout
router.get("/logout", usersController.logout);

module.exports = router;