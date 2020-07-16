var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var session = require('express-session');

// required for passport session
router.use(session({
    secret: 'secrettexthere',
    saveUninitialized: false,
    resave: false,
  
  }));

var db = require('mongoskin').db("mongodb://admin:Whycant1login@bookingcalendardata-shard-00-00.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-01.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-02.tykzd.mongodb.net:27017/bookingCalendarDatabase?ssl=true&replicaSet=atlas-oplbzk-shard-0&authSource=admin&retryWrites=true&w=majority");
db.bind('event_sitges');


//sitges calendar data
router.get("/calendar", isLoggedIn, function(req, res, next) {
    var admin = false;
    if (req.user.username === 'admin'){
        admin = true;
    }
    res.render("calendar-sitges", {admin: admin, isLoggedIn:true, username: req.user.username});
  });

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

  function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
      return next();
    }
    return res.redirect("/login");
  }
  module.exports = router;