var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var session = require('express-session');

var db = require('mongoskin').db("mongodb:admin:Whycant1login//@bookingcalendardata-shard-00-00.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-01.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-02.tykzd.mongodb.net:27017/bookingCalendarDatabase?ssl=true&replicaSet=atlas-oplbzk-shard-0&authSource=admin&retryWrites=true&w=majority");
    db.bind('event_sitges');

// required for passport session
router.use(session({
  secret: 'secrettexthere',
  saveUninitialized: false,
  resave: false,

}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//palm-springs calendar data

/* GET home page. */
router.get("/register", adminLoggedIn, function(req,res){
  res.render("register", {isLoggedIn: false});
});

router.post("/register", adminLoggedIn, function(req,res){
  var newUser = new User({username: req.body.username});
  User.register( newUser, req.body.password, function(err, user){
    if (err)
    {
      console.log(err);
      return res.render("register", {error: err});
    }
    passport.authenticate("local")(req,res,function(){
      res.redirect("/selectPage");
    });
  } );
});
router.get('/login', hasLoggedIn, function(req, res, next) {
  console.log(req.isAuthenticated());
  res.render("login", {isLoggedIn: false});
});
router.post("/login", hasLoggedIn, passport.authenticate("local", {
  successRedirect: "/selectPage",
  failureRedirect: "/login"
}), function(req, res){
  console.log("Success");
});
router.get("/logout", function(req,res){
  req.logout();
  res.redirect("/login");
});
router.get('/selectPage', isLoggedIn, function(req, res, next) {

  var isAdmin = false;
  if (req.user.username === 'admin'){
    isAdmin = true;
  }
 
  res.render('selectPage', {isLoggedIn:req.isAuthenticated(), admin:isAdmin, username: req.user.username});
});

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  return res.redirect("/login");
}

function hasLoggedIn(req, res, next){
  if (!req.isAuthenticated()){
    return next();
  }
  return res.redirect("/selectPage");
}

function adminLoggedIn(req, res, next){
  if (req.user === undefined){
    return res.redirect("/login");
  }
  if(req.user.username === "admin"){
    return next();
  }
  return res.redirect("/login");
}
module.exports = router;
