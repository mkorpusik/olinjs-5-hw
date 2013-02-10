
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log(req.user);
  url = "";
  res.render('index', {url:url, title: 'MyFacebookSpace' });
};