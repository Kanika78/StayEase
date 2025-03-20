const User = require("../models/user.js");

module.exports.renderSignupform = (req , res)=>{
    res.render("user/signup.ejs");
}

module.exports.signup = async(req , res)=>{
try{
    let{username , email , password} = req.body;
    const newUser = new User({email , username});
    const registered = await User.register(newUser , password);
    // console.log(registered);
    //as soon as user is registered automatic log in should be done
    req.login(registered , (err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "Welcome to WanderLust");
        res.redirect("/listings");
    });
}
catch(err){
    req.flash("error" , err.message);
    res.redirect("/signup");
}


}

module.exports.loginForm = (req , res)=>{
    res.render("user/login.ejs")
}

module.exports.login = async(req , res)=>{
    req.flash("success","Welcome back to WanderLust!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req , res , next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success" , "You are logged out");
        res.redirect("/listings");
    })
}