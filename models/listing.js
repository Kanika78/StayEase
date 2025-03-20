const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    image : {
        url : String,
        filename : String
    },
    price : {
        type : Number
    },
    location : {
        type : String
    },
    country : {
        type : String
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    geometry :  {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    category: {
        type: String,
        enum: ["Rooms", "Iconic cities", "Mountains", "Castles", "Amazing pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
        required: true
    }
});
//to delete review review from review collection when listing is deleted
ListingSchema.post("findOneAndDelete" , async (Listing)=>{
    if(Listing){
        let result = await Review.deleteMany({_id : {$in : Listing.reviews}});
        console.log(result);
    }
})

const Listing = mongoose.model("Listing" , ListingSchema);
module.exports = Listing;