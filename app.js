if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
//to validate schema we have tool called joi
//requiring routes from route folder
const session = require("express-session");
const MongoStore = require("connect-mongo"); 
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";
const dburl = process.env.ATLASDB_URL

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

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs' ,ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl : dburl,
  crypto :{
    secret : process.env.SECRET
  },
  touchAfter : 24 * 60 *60
});

store.on("error" , function(e){
  console.log("Session store error" , e);
})

const sessionOptions = {
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
};




app.use(session(sessionOptions));
app.use(flash());

//session will use passport so it should be implemented
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//middleware to display flash message
app.use((req , res , next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

//Demo user
// app.get("/demouser" , async(req, res)=>{
//   let fakeuser = new User({
//     email : "fakeuser@gmail.com",
//     username : "delta-user",
//   });

//   let newUser = await User.register(fakeuser , "abcd");
//   console.log(newUser);
//   res.send(newUser);




// })


//using routes
app.use("/listings" , listings);
app.use("/listings/:id/reviews" , reviews);
app.use("/" , userRouter);



//creating custom error if req match with above route they will execute otherwise 
app.all("*" , (req , res , next)=>{
  next(new ExpressError(404 , "page not found"));
})


//middleware to handle error
app.use((err , req , res , next)=>{
  let{statusCode = 500 , message = "something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs" , {err});

  // res.send("something went wrong");
});

app.listen(8080, (req , res)=>{
    console.log("server listening at 8080");
});
