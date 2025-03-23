import dotenv from 'dotenv';
dotenv.config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dburl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

const initDB = async () => {
  await Listing.deleteMany({}); // delete any data already present in database
  initData.data = initData.data.map((obj)=>({...obj , owner : '67d03dd00e4a2789e7a8b74e'}));// add the owner id to the data
  await Listing.insertMany(initData.data);// enter the data exported from dats.js
  console.log("data was initialized");
};

initDB();