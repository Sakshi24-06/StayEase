const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview,isLoggedIn, isReviewAuthor } = require("../middleware.js"); 
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const reviewsController = require("../controllers/reviews.js");
//Review Routes
//post route for reviews
router.post("/",
   isLoggedIn,
   validateReview,
  
  wrapAsync(reviewsController.createReview));

//Delete Reviews
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewsController.destroyReview)
);


module.exports = router;
    