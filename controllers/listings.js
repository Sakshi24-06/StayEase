const Listing = require("../models/listing");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const geocode = require("../utils/geocode");

// Helper Function
const addRating = (listing) => {

    const ratings = (listing.reviews || [])
        .map((review) => review.rating)
        .filter(Boolean);

    listing.averageRating = ratings.length
        ? (
            ratings.reduce((sum, value) => sum + value, 0) / ratings.length
        ).toFixed(1)
        : null;

    listing.reviewCount = ratings.length;

    return listing;

};

const uploadedImages = (files) =>
    (files || []).map((file) => ({
        url: file.path,
        filename: file.filename,
    }));

// =========================
// Show All Listings
// =========================
module.exports.index = async (req, res) => {

    const {
        category,
        location,
        checkin,
        checkout,
        guests,
    } = req.query;

    const filters = [];

    if (category) {
        filters.push({ category });
    }

    if (location) {

        const search = new RegExp(location.trim(), "i");

        filters.push({
            $or: [
                { title: search },
                { location: search },
                { country: search },
            ],
        });

    }

    const allListings = (
        await Listing.find(
            filters.length
                ? { $and: filters }
                : {}
        ).populate("reviews")
    ).map(addRating);

    res.render("listings/index.ejs", {
        allListings,
        selectedCategory: category || "",
        searchQuery: location || "",
        searchDates: {
            checkin: checkin || "",
            checkout: checkout || "",
            guests: guests || "",
        },
    });

};

// =========================
// My Listings
// =========================
module.exports.myListings = async (req, res) => {

    const allListings = (
        await Listing.find({
            author: req.user._id,
        }).populate("reviews")
    ).map(addRating);

    res.render("listings/my-listings.ejs", {
        allListings,
        selectedCategory: "",
        searchQuery: "",
    });

};

// =========================
// Render New Form
// =========================
module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");

};

// =========================
// Show Listing
// =========================
module.exports.showListing = async (req, res) => {

    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");

    if (!listing) {

        req.flash(
            "error",
            "That stay is no longer available."
        );

        return res.redirect("/listings");

    }

    addRating(listing);

    const hostListingCount = listing.author
        ? await Listing.countDocuments({
            author: listing.author._id,
        })
        : 0;

    const isSaved = Boolean(
        req.user &&
        req.user.savedListings?.some((savedId) =>
            savedId.equals(listing._id)
        )
    );

    res.render("listings/show.ejs", {
        listing,
        hostListingCount,
        isSaved,
    });

};

// =========================
// Create Listing
// =========================
module.exports.createListing = async (req, res) => {

    if (!req.body.listing) {
        throw new ExpressError(
            400,
            "Invalid listing data."
        );
    }

    const newListing = new Listing(req.body.listing);

    const images = uploadedImages(req.files);

    if (images.length) {

        newListing.images = images;
        newListing.image = images[0];

    }

    const coordinates = await geocode(
        newListing.location,
        newListing.country
    );

    if (coordinates) {

        newListing.geometry = {
            type: "Point",
            coordinates: [
                coordinates.lon,
                coordinates.lat,
            ],
        };

    }

    newListing.author = req.user._id;

    await newListing.save();

    req.flash(
        "success",
        "Your listing is live!"
    );

    res.redirect(`/listings/${newListing._id}`);

};

// =========================
// Render Edit Form
// =========================
module.exports.renderEditForm = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {

        req.flash(
            "error",
            "That stay is no longer available."
        );

        return res.redirect("/listings");

    }

    res.render("listings/edit.ejs", {
        listing,
    });

};

// =========================
// Update Listing
// =========================
module.exports.updateListing = async (req, res) => {

    if (!req.body.listing) {

        throw new ExpressError(
            400,
            "Invalid listing data."
        );

    }

    const listing = await Listing.findByIdAndUpdate(
        req.params.id,
        req.body.listing,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!listing) {

        req.flash(
            "error",
            "Listing not found."
        );

        return res.redirect("/listings");

    }

    const images = uploadedImages(req.files);

    if (images.length) {

        listing.images = [
            ...(listing.images || []),
            ...images,
        ];

        listing.image = listing.images[0];

    }

    const coordinates = await geocode(
        listing.location,
        listing.country
    );

    if (coordinates) {

        listing.geometry = {
            type: "Point",
            coordinates: [
                coordinates.lon,
                coordinates.lat,
            ],
        };

    }

    await listing.save();

    req.flash(
        "success",
        "Listing updated."
    );

    res.redirect(`/listings/${listing._id}`);

};

// =========================
// Save / Unsave Listing
// =========================
module.exports.toggleSave = async (req, res) => {

    const user = await User.findById(req.user._id);

    const index = user.savedListings.findIndex(
        (savedId) =>
            savedId.equals(req.params.id)
    );

    if (index >= 0) {

        user.savedListings.splice(index, 1);

        req.flash(
            "success",
            "Removed from saved stays."
        );

    } else {

        user.savedListings.push(req.params.id);

        req.flash(
            "success",
            "Saved to your favourites."
        );

    }

    await user.save();

    res.redirect(
        req.get("referer") ||
        `/listings/${req.params.id}`
    );

};

// =========================
// Delete Listing
// =========================
module.exports.destroyListing = async (req, res) => {

    await Listing.findByIdAndDelete(req.params.id);

    req.flash(
        "success",
        "Listing deleted."
    );

    res.redirect("/listings/mine");

};