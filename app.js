if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ====================================
// MongoDB Connection
// ====================================



const dburl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dburl);
}

main()
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.log(err);
    });

// ====================================
// View Engine
// ====================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ====================================
// Middlewares
// ====================================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ====================================
// Session Store
// ====================================

const store = MongoStore.create({
    mongoUrl: dburl,

    touchAfter: 24 * 60 * 60,

    crypto: {
        secret: process.env.SECRET,
    },
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store: store,

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,

        maxAge: 1000 * 60 * 60 * 24 * 7,

        httpOnly: true,
    },
};

// ====================================
// Flash & Session
// ====================================

app.use(session(sessionOptions));
app.use(flash());

// ====================================
// Passport Configuration
// ====================================

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(User.authenticate())
);

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);

// ====================================
// Global Variables
// ====================================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.currentUser = req.user;

    next();

});

// ====================================
// Demo User
// ====================================

// app.get("/demouser", async (req, res) => {

//     let fakeUser = new User({
//         email: "demo@example.com",
//         username: "demouser",
//     });

//     let registeredUser = await User.register(
//         fakeUser,
//         "demopassword"
//     );

//     res.send(registeredUser);

// });

// ====================================
// Routes
// ====================================

app.use(
    "/listings",
    listingsRouter
);

app.use(
    "/listings/:id/reviews",
    reviewsRouter
);

app.use(
    "/",
    userRouter
);

// ====================================
// 404 Error
// ====================================

app.use((req, res, next) => {

    next(
        new ExpressError(
            404,
            "Page Not Found"
        )
    );

});

// ====================================
// Error Handler
// ====================================

app.use((err, req, res, next) => {

    console.log("========== ERROR ==========");
    console.error(err);
    console.log("===========================");

    let { statusCode = 500 } = err;

    res
        .status(statusCode)
        .render("error.ejs", {
            err,
        });

});

// ====================================
// Server
// ====================================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});