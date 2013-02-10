
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

function facebookGetUser() {
  return function(req, res, next) {
    req.facebook.getUser( function(err, user) {
      if (!user || err){
        res.send("you need to login");
      } else {
        req.user = user;
        next();
      }
    });
  }
}

app.get('/myspace', facebookGetUser(), function(req, res){
    var data = Facebook.prototype.getPersistentData("userData");
    console.log(data)
    res.send("hello there", req.user);
    res.redirect('/');
});

app.get('/login', Facebook.loginRequired(), function (req, res) {
  req.facebook.api('/me/picture?redirect=false&type=large', function(err, data) {
    console.log("user", data);
    //res.writeHead(200, {'Content-Type': 'text/plain'});
    res.send(data);
    Facebook.prototype.setPersistentData("userData", data);
    res.redirect('/myspace'); 
  });
});

app.get('/logout', facebookGetUser(), function(req, res){
  req.user = null;
  req.session.destroy();
  res.redirect('/');
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
