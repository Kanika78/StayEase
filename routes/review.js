const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAuthor , validateReview} = require("../middleware.js");
const reviewController = require("../controllers/review.js");


//Reviews
//post route
router.post("/" ,isLoggedIn,validateReview, wrapAsync(reviewController.create));

//Delete Review Route
router.delete("/:reviewId" , isLoggedIn,isAuthor,wrapAsync(reviewController.delete));

module.exports = router;


