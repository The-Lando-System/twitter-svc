var express = require('express')
var request = require('request')
var pathLib = require('path')

// App Setup =========================

var base = pathLib.resolve(__dirname);
var configFile = require(base + '/config');

var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Global Vars =====================

var _consumerKey = configFile.consumerKey;
var _consumerSecret = configFile.consumerSecret;

var _oauth2Url = 'https://api.twitter.com/oauth2/token';
var _userStatusUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';


// Routes ===========================

app.get('/tweets/:username/:count', function (req, res) {

  getAccessToken(function (error, response, body) {
    if (!error && response.statusCode == 200) {

      body = JSON.parse(body);

      var url = _userStatusUrl + buildRequestParams({
        'screen_name': req.params.username,
        'count': req.params.count,
        'exclude_replies': 'true'
      });
      
      var headers = {
        'Authorization': 'Bearer ' + body.access_token
      }
    
      var options = {
          url: url,
          method: 'GET',
          headers: headers
      }
    
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(JSON.parse(body));
        }
      })
    }
  });
});

app.listen(3001, function () {
  console.log('twitter-svc app listening on port 3001!');
});

// Helper Functions =========================

var buildRequestParams = function(params) {
  var reqParamStr = '?';
  for (var paramKey in params) {
    reqParamStr += paramKey + '=' + params[paramKey];
    reqParamStr += '&'
  }
  return reqParamStr.slice(0, -1);
};


var getAccessToken = function(callback) {
  var authStr = new Buffer( _consumerKey + ':' + _consumerSecret).toString('base64');

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + authStr
  }
  
  var options = {
      url: _oauth2Url,
      method: 'POST',
      headers: headers,
      form: {'grant_type': 'client_credentials'}
  }
  
  request(options, callback);
}