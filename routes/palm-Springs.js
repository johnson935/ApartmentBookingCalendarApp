var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var session = require('express-session');
var db2 = require('mongoskin').db("mongodb://@bookingcalendardata-shard-00-00.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-01.tykzd.mongodb.net:27017,bookingcalendardata-shard-00-02.tykzd.mongodb.net:27017/bookingCalendarDatabase2?ssl=true&replicaSet=atlas-oplbzk-shard-0&authSource=admin&retryWrites=true&w=majority");
    db2.bind('event_palmSprings');

// required for passport session
router.use(session({
    secret: 'secrettexthere',
    saveUninitialized: false,
    resave: false,
  
  }));

router.get("/calendar", isLoggedIn, function(req, res, next) {
        var admin = false;
        if (req.user.username === 'admin'){
            admin = true;
        }
        res.render("calendar-palmSprings", {admin: admin, isLoggedIn:true, username: req.user.username});
      });

router.get('/data_palmSprings', function(req, res){
    db2.event_palmSprings.find().toArray(function(err, data){
        //set id property for all records
        if (data !== undefined){
          for (var i = 0; i < data.length; i++){
            data[i].id = data[i]._id;
          }
  
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
        db2.event_palmSprings.updateById( sid, data, update_response);
    else if (mode == "inserted")
        db2.event_palmSprings.insert(data, update_response);
    else if (mode == "deleted")
        db2.event_palmSprings.removeById( sid, update_response);
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
