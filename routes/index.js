
/*
 * GET home page.
 */

var models = require('../models');
var util = require('util');
var User = models.User;

exports.index = function(req, res){
  console.log("home page");
  res.render('index', {title: 'MyFacebookSpace' });
};

exports.index2 = function(req, res){
  console.log(util.inspect(req.session.user));
  console.log("session user "+req.session.user);
  //var img_url = req.session.user[0].img_url;
  //var color = req.session.user[0].color;
  id = req.session.user[0].fb_id;
  var user = User.find({fb_id:id}, function (err, loggedInUser) {
    if (err)
        return console.log("error");
    console.log("docs "+loggedInUser);
    //var color = loggedInUser.color;
    //var img_url = loggedInUser.img_url;
    //console.log(color);
    //console.log(img_url);
    res.render('index2', {loggedInUser:loggedInUser, title: 'MyFacebookSpace' });
  });
  
};

exports.color = function(req, res){
  console.log("changing color");
  var color = req.body.color;
  console.log(color);
  id = req.session.user[0].fb_id;
  User.update({fb_id:id}, {$set: {'color': color}}, function(err){
  	console.log("test");
    res.redirect('/');
  });

};