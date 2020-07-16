var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var session = require('express-session');

var db = require('mongoskin').db("mongodb://admin:Whycant1login@bookingcalendardata-shard-00-00.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-01.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-02.tykzd.mongodb.net:27017/bookingCalendarDatabase?ssl=true&replicaSet=atlas-oplbzk-shard-0&authSource=admin&retryWrites=true&w=majority");
    db.bind('event_sitges');
    db.bind('event_palmSprings');
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

router.get('/init', function(req, res){
  db.event_sitges.insert({
      text:"My test event A",
      start_date: new Date(2020,7,16),
      end_date:   new Date(2020,7,17)
  });
  db.event_sitges.insert({
      text:"One more test event",
      start_date: new Date(2020,7,18),
      end_date:   new Date(2020,7,20),
      color: "#DD8616"
  });

  /*... skipping similar code for other test events...*/

  res.send("Test events were added to the database")
});

//sitges calendar data

router.get('/data_sitges', function(req, res){
  db.event_sitges.find().toArray(function(err, data){
      //set id property for all records
      if (data !== undefined){
        for (var i = 0; i < data.length; i++)
        data[i].id = data[i]._id;

    //output response
        res.send(data);
      } 
  });
});
router.post('/data_sitges', function(req, res){
  var data = req.body;

  //get operation type
  var mode = data["!nativeeditor_status"];
  //get id of record
  var sid = data.id;
  var tid = sid;

  //remove properties which we do not want to save in DB
  delete data.id;
  delete data["!nativeeditor_status"];


  //output confirmation response
  function update_response(err, result){
      if (err)
          mode = "error";
      else if (mode == "inserted")
          tid = data._id;

      res.setHeader("Content-Type","application/json");
      res.send({action: mode, sid: sid, tid: tid});

  }

  //run db operation
  if (mode == "updated")
      db.event_sitges.updateById( sid, data, update_response);
  else if (mode == "inserted")
      db.event_sitges.insert(data, update_response);
  else if (mode == "deleted")
      db.event_sitges.removeById( sid, update_response);
  else
      res.send("Not supported operation");
});

//palm-springs calendar data
router.get('/data_palmSprings', function(req, res){
  db.event_palmSprings.find().toArray(function(err, data){
      //set id property for all records
      if (data !== undefined){
        for (var i = 0; i < data.length; i++)
        data[i].id = data[i]._id;

    //output response
        res.send(data);
      } 
  });
});
router.post('/data_palmSprings', function(req, res){
  var data = req.body;

  //get operation type
  var mode = data["!nativeeditor_status"];
  //get id of record
  var sid = data.id;
  var tid = sid;

  //remove properties which we do not want to save in DB
  delete data.id;
  delete data["!nativeeditor_status"];


  //output confirmation response
  function update_response(err, result){
      if (err)
          mode = "error";
      else if (mode == "inserted")
          tid = data._id;

      res.setHeader("Content-Type","application/json");
      res.send({action: mode, sid: sid, tid: tid});

  }

  //run db operation
  if (mode == "updated")
      db.event_palmSprings.updateById( sid, data, update_response);
  else if (mode == "inserted")
      db.event_palmSprings.insert(data, update_response);
  else if (mode == "deleted")
      db.event_palmSprings.removeById( sid, update_response);
  else
      res.send("Not supported operation");
});
/* GET home page. */
router.get("/register", hasLoggedIn,function(req,res){
  res.render("register", {isLoggedIn: false});
});

router.post("/register", function(req,res){
  var newUser = new User({username: req.body.username});
  User.register( newUser, req.body.password, function(err, user){
    if (err)
    {
      console.log(err);
      return res.render("register", {error: err});
    }
    passport.authenticate("local")(req,res,function(){
      res.redirect("/calendar");
    });
  } );
});
router.get('/login', hasLoggedIn, function(req, res, next) {
  console.log(req.isAuthenticated());
  res.render("login", {isLoggedIn: false});
});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/calendar",
  failureRedirect: "/login"
}), function(req, res){
  console.log("Success");
});
router.get("/logout", function(req,res){
  req.logout();
  res.redirect("/login", {isLoggedIn: false});
});
router.get('/calendar', isLoggedIn, function(req, res, next) {

  var isAdmin = false;
  if (req.user.username === 'admin'){
    isAdmin = true;
  }
 
  res.render('calendar', {isLoggedIn:req.isAuthenticated(), admin:isAdmin});
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
  return res.redirect("/calendar");
}
module.exports = router;
