var config = {db:{}};
var env =  process.env.NODE_ENV || "development";

if ( env == 'production' ){
  //load prod env specific config options
  config.dbInfo = require('./production');
} else if ( env == 'staging' ) {
  //load staging specific config options
  config.dbInfo = require('./staging');
} else if ( env == 'ci' ) {
  
  config.dbInfo = require('./testing');
} else {
  //assume development env if not explicitly prod or staging
  config.dbInfo = require('./development');
}

var graphdb = require('seraph')({
  server: config.dbInfo.server,
  endpoint: config.dbInfo.endpoint,
  user: config.dbInfo.user,
  pass: config.dbInfo.pass,
  id: config.dbInfo.id
});

config.db = graphdb;

module.exports = config;