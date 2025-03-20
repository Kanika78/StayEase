const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review");


//middleware to check if user is logged in or not
module.exports.isLoggedIn = (req , res , next)=>{
    if(!req.isAuthenticated()){
        //to check if user is already logged in only then it can create a listing

        //if user is not logged in make it login and redirect to path they were try to access 
        req.session.redirectUrl = req.originalUrl;
       req.flash("error" ,"You must be logged in to create listing");
       return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req , res , next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req , res , next)=>{
    let { id } = req.params;
    // console.log(id);
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error" , "You are not authorized to edit this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing = (req , res , next)=>{
    let {error} = listingSchema.validate(req.body)//validate the listing with listingschema created in joi
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

module.exports.isAuthor = async (req , res , next)=>{
    let {reviewId , id} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error" , "You are not authorized to delete this review");
      return res.redirect(`/listings/${id}`);
    }
    next();

}

module.exports.validateReview = (req , res , next)=>{
    let {error} = reviewSchema.validate(req.body)//validate the listing with listingschema created in joi
    if(error){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(400 , errMsg);
    }else{
      next();
    }
};