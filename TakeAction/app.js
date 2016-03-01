var express = require('express');
var http = require('http');
var path = require('path');
var nunjucks  = require('nunjucks');
var favicon = require('serve-favicon'); //Will use later
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require('express-session');
var graphdb = require('./config/settings.js');

var flash = require("flash");
var passport = require("passport");
LocalStrategy = require('passport-local').Strategy;

// PG DB TEST
var dbconfig = require('./config/settings.js');
var pg = require('pg');
var pgSession = require('connect-pg-simple')(session);
var connectionString = "postgres://postgres:mercury12@localhost/wha";

var client = new pg.Client(connectionString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    console.log("Postgres connection successful on "+result.rows[0].theTime);
    //output: Week Day Month Day Year Time GMT-600 (CST)
    client.end();
  });
});

// client.connect();
// var query = client.query('CREATE TABLE users(
//   id SERIAL PRIMARY KEY, username VARCHAR(40) not null, password VARCHAR(40) not null, complete BOOLEAN
// )');
// query.on('end', function() { client.end(); });

//End PG DB 

var app = express();

// view engine setup
nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','html');

//Port set up
app.listen(3002, function () {
  console.log('MATCH app listening on port 3002!');
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//TODO: Move to controller
app.get('/test', function(req, res) {
  res.render('test.html', {
    title : 'My First Nunjucks Page',
    items : [
      { name : 'WHAT' },
      { name : 'Form' },
      { name : 'About' },
      { name : 'Contact' },
    ]
  });
});

app.get('/', function(req, res) {
  res.render('index.html', {
    title : 'Welcome to WHA',
  });
});

// Process the login: Admins for now
app.post('/login', 
    passport.authenticate('local-login', { failureRedirect : '/#portfolioModal4', failureFlash : true }),
    function(req,res){
        res.redirect("/test");
    }
);
//end TODO

//This needs to be below the Nunjucks for some reason.
app.use(express.static(path.join(__dirname, 'public')));

//Passport Login Test
 // Required for Passport Test
app.use(session({
  store: new pgSession({
    pg : pg,                                  // Use global pg-module
    conString : connectionString, // Connect using something else than default DATABASE_URL env variable
    tableName : 'session'               // Use another table-name than the default "session" one
  }),
  secret: "thisisverysekritandsafe",
  saveUninitialized: true,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
//End Passport Test

//TODO: Move to model
//This will become part of the model used to create and manipulate data sets returns.
graphdb.db.save({ name: "Test-Person", age: 40 }, function(err, node) {
  if (err) throw err;
  console.log("Test-Person inserted.");

  graphdb.db.delete(node, function(err) {
    if (err) throw err;
    console.log("Test-Person deleted.");
    console.log("Neo4J connection test successful.");
  });
});
//End TODO

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
console.log("Server has started.");
