const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

const listingController = require("../controllers/listing.js");

//index route that show all listings
router.get("/" , wrapAsync(listingController.index));

//NEW ROUTE
router.get("/new" , isLoggedIn, listingController.new);

//CREATE ROUTE
router.post("/" ,isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(listingController.create));

router.get("/filter/:q", wrapAsync(listingController.filterListings));

router.get("/search", wrapAsync(listingController.search));


//show route that show specific listings data
router.get("/:id" , wrapAsync(listingController.show));

//Edit Route
router.get("/:id/edit" ,isLoggedIn,isOwner, wrapAsync(listingController.edit));

//UPDATE ROUTE
router.put("/:id" ,isLoggedIn,isOwner,upload.single('listing[image]') , validateListing,wrapAsync(listingController.update));

//DELETE ROUTE
router.delete("/:id" ,isLoggedIn,isOwner,wrapAsync(listingController.delete));

module.exports = router;