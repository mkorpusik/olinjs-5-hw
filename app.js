
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , Facebook = require('facebook-node-sdk');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('bed3f904d695eba0eaa42c129bf911e9'));
  app.use(express.session());
  app.use(Facebook.middleware({ appId:'214137922057844', secret: 'bed3f904d695eba0eaa42c129bf911e9' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var models = require('./models');
var User = models.User;

function facebookGetUser() {
  return function(req, res, next) {
    req.facebook.getUser( function(err, user) {
      if (!user || err){
        //res.send("you need to login");
        res.render('login', {title:"Login"});
      } else {
        console.log(user);
        req.user = user;
        next();
      }
    });
  }
}

/*
app.get('/myspace', facebookGetUser(), function(req, res){
    var user = req.session.user;
    console.log(user);
    //res.send("hello there", req.user);
    res.redirect('/loggedIn');
});
*/

app.get('/login', Facebook.loginRequired(), function (req, res) {
  var fb_id = req.facebook.user;

  req.facebook.api('/me', function(err, data) {
    ///picture?redirect=false&type=large
    console.log("user", data);
    var image = "http://graph.facebook.com/" + data.username + "/picture?width=200&height=200";
    //res.send(data);

    var exists =  User.find({fb_id:fb_id}, function (err, docs) {
      console.log(docs.length);

      // user does not exist already
      if (docs.length==0) {
        var user = new User({ fb_id:fb_id, img_url: image, color: 'white'});
        console.log("new user "+user);
        user.save(function (err) {
          if (err)
            return console.log("error: couldn't save user");
          req.session.user = user;
          //console.log("session user "+req.session.user);
          res.redirect('/');
        });
        //return;
      }
    
      // login with sessions if user exists
      else if (docs.length>0){
        var user = docs;
        console.log("existing user "+user);
        req.session.user = user;
        //console.log("session user "+req.session.user);
        res.redirect('/');
      }

      if (err)
        return console.log("error", exists);
    });
 
  });
  
});

app.get('/logout', function(req, res){
  req.user = null;
  req.session.destroy();
  console.log("logged out");
  res.redirect('/');
});

app.get('/', facebookGetUser(), routes.index2);
app.post('/color', routes.color);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
