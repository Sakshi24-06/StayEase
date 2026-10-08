const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const {
    isLoggedIn,
    isAuthor,
    validateListing,
} = require("../middleware");

const listingsController = require("../controllers/listings");

const multer = require("multer");
const { storage } = require("../cloudConfig");

const upload = multer({ storage });

// Index & Create Listing
router
    .route("/")
    .get(
        wrapAsync(listingsController.index)
    )
    .post(
        isLoggedIn,
        upload.array("listing[images]", 5),
        validateListing,
        wrapAsync(listingsController.createListing)
    );

// New Listing Form
router.get(
    "/new",
    isLoggedIn,
    listingsController.renderNewForm
);

// My Listings
router.get(
    "/mine",
    isLoggedIn,
    wrapAsync(listingsController.myListings)
);

// Save / Unsave Listing
router.post(
    "/:id/save",
    isLoggedIn,
    wrapAsync(listingsController.toggleSave)
);

// Show, Update & Delete Listing
router
    .route("/:id")
    .get(
        wrapAsync(listingsController.showListing)
    )
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("listing[images]", 5),
        validateListing,
        wrapAsync(listingsController.updateListing)
    )
    .delete(
        isLoggedIn,
        isAuthor,
        wrapAsync(listingsController.destroyListing)
    );

// Edit Listing Form
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    wrapAsync(listingsController.renderEditForm)
);

module.exports = router;