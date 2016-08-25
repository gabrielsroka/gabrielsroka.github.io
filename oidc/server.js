var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var os = require('os');
var yargs = require('yargs');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-oauth2-jwt-bearer').Strategy;
var OktaConfig = require('./js/config');

/**
 * Globals
 */

var app = express();
var httpServer = http.createServer(app);
var imgBytes = fs.readFileSync(path.join(__dirname, './images/oauth2.png'));
var imgString = new Buffer(imgBytes).toString('base64');


/**
 * Arguments
 */

console.log();
console.log('loading configuration...');
var argv = yargs
  .usage('\nSimple API Server with OAuth 2.0 Bearer Token Security\n\n' +
      'Usage:\n\t$0 -iss {url} -aud {uri}', {
    port: {
      description: 'Web Server Listener Port',
      required: true,
      alias: 'p',
      default: 8080
    },
    issuer: {
      description: 'OpenID Connect Provider Issuer URL',
      required: true,
      alias: 'iss',
      default: OktaConfig.orgUrl
    },
    audience: {
      description: 'ID Token Audience URI (ClientID)',
      required: true,
      alias: 'aud',
      default: OktaConfig.clientId
    }
  })
  .example('\t$0 --iss https://example.okta.com --aud ANRZhyDh8HBFN5abN6Rg', '')
  .argv;


console.log();
console.log('Listener Port:\n\t' + argv.port);
console.log('OIDC Issuer URL:\n\t' + argv.issuer);
console.log('Audience URI:\n\t' + argv.audience);
console.log();

/**
 * Middleware
 */

app.use(logger('dev'));
app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(passport.initialize());
passport.use(new Strategy({
  issuer: argv.issuer,
  audience: argv.audience,
  metadataUrl: url.resolve(argv.issuer, '/.well-known/openid-configuration'),
  loggingLevel: 'debug'
}, function(token, done) {
  // done(err, user, info)
  return done(null, token);
}));

app.get('/profile',
  passport.authenticate('oauth2-jwt-bearer', { session: false }),
  function(req, res) {
    res.json(req.user);
  });

app.get('/protected',
  passport.authenticate('oauth2-jwt-bearer', { session: false }),
  function(req, res) {
    console.log('Accessing protected resource as ' + req.user.email);
    res.set('Content-Type', 'application/x-octet-stream');
    res.send(imgString);
  });

/**
 * Start API Web Server
 */

console.log('starting server...');
app.set('port', argv.port);
httpServer.listen(app.get('port'), function() {
  var scheme   = argv.https ? 'https' : 'http',
      address  = httpServer.address(),
      hostname = os.hostname();
      baseUrl  = address.address === '0.0.0.0' ?
        scheme + '://' + hostname + ':' + address.port :
        scheme + '://localhost:' + address.port;

  console.log('listening on port: ' + app.get('port'));
  console.log();
});
