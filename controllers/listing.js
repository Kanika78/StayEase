const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req , res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}
module.exports.new = (req , res)=>{
    console.log(req.user);
    res.render("listings/new.ejs");
}

module.exports.create = async(req , res, next)=>{
    try{
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
          })
        .send();
    
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
    
        newListing.geometry = response.body.features[0].geometry;
    
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    }catch(err){
        console.log(err);
        next(err);
    }

        
};

module.exports.show = async(req , res)=>{
let { id } = req.params;
const listing = await Listing.findById(id).populate({path :"reviews" , populate : {path : "author"}}).populate("owner"); //populate is used to show data in listing.reviews
if(!listing){
    req.flash("error" , "Listing You requested for not existed");
    res.redirect("/listings");
}
else{
    res.render("listings/show.ejs" , {listing});
    console.log(listing);

}
}

module.exports.edit = async(req , res)=>{
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error" , "Listing You requested for not existed");
    res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImage = originalImage.replace("/upload" , "/upload/w_250,c_thumb");

  res.render("listings/edit.ejs" , {listing , originalImage});
}

module.exports.update = async(req , res)=>{
// if(!req.body.listing){
//   throw new ExpressError(400, "Send valid data for listing" );
// }
const { id } = req.params;
const { title, description, price, location, country, category } = req.body.listing;
const listing = await Listing.findByIdAndUpdate(id, { title, description, price, location, country, category });
if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
}
await listing.save();
req.flash('success', 'Successfully updated the listing');
res.redirect(`/listings/${listing._id}`);
}

module.exports.delete = async(req , res)=>{
let {id} = req.params;
let deletedListing = await Listing.findByIdAndDelete(id);
console.log(deletedListing); 
req.flash("success" , "Listing deleted");
res.redirect("/listings");
}

module.exports.filterListings = async (req, res, next) => {
  const { q } = req.params;
  const filteredListings = await Listing.find({category: q }).exec();
  if (!filteredListings.length) {
      req.flash("error", "No Listings exists for this filter!");
      res.redirect("/listings");
      return;
  }
  res.locals.success = `Listings Filtered by ${q}`;
  res.render("listings/index.ejs", { allListings: filteredListings });
}

module.exports.search = async(req, res) => {
  console.log(req.query.q);
  let input = req.query.q.trim().replace(/\s+/g, " "); //remove start and end space
  console.log(input);
  if(input == "" || input == " "){
      //search value is empty
      req.flash("error", "Search value empty!!!");
      res.redirect("/listings");
  }

  //convert every word first letter capital and other small
  let data = input.split("");
  let element = "";
  let flag = false;
  for(let index = 0; index < data.length; index++) {
      if (index == 0 || flag) {
          element = element + data[index].toUpperCase();
      } else {
          element = element + data[index].toLowerCase();
      }
      flag = data[index] == " ";
  }
  console.log(element);

  let allListings = await Listing.find({
      title: { $regex: element, $options: "i"},
  });
  if(allListings.length !=0 ){
      res.locals.success = "Listings searched by title";
      res.render("listings/index.ejs", {allListings});
      return;
  }
  if(allListings.length == 0){
      allListings = await Listing.find({
          category: { $regex: element, $options: "i"},
      }).sort({_id: -1});
      if(allListings.length != 0) {
          res.locals.success = "Listings searched by category";
          res.render("listings/index.ejs", {allListings});
          return;
      }
  }
  if(allListings.length == 0) {
      allListings = await Listing.find({
          country: { $regex: element, $options: "i"},
      }).sort({_id: -1});
      if(allListings.length != 0) {
          res.locals.success = "Listings searched by country";
          res.render("listings/index.ejs", {allListings});
          return;
      }
  }
  if(allListings.length == 0) {
      allListings = await Listing.find({
          location: { $regex: element, $options: "i"},
      }).sort({_id: -1});
      if(allListings.length != 0) {
          res.locals.success = "Listings searched by location";
          res.render("listings/index.ejs", {allListings});
          return;
      }
  }

  const intValue = parseInt(element, 10); //10 for decimal return - int ya NaN
  const intDec = Number.isInteger(intValue); //check intValue is number or not

  if(allListings.length == 0 && intDec) {
      allListings = await Listing.find({ price: { $lte: element }}).sort({
          price: 1,
      });
      if(allListings.length != 0) {
          res.locals.success = `Listings searched for less than Rs ${element}`;
          res.render("listings/index.ejs", { allListings });
          return;
      }
  }
  if(allListings.length == 0) {
      req.flash("error", "Listings is not here !!!");
      res.redirect("/listings");
  }
}