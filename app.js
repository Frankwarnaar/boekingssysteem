// Load modules
var path = require('path'), // core
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    multer = require('multer'),
    mysql = require('mysql'),
    myConnection = require('express-myconnection');


// Define upload dir
var upload = multer({dest: 'public/uploads/'});

// Define routers
var usersRouter = require('./routes/users'),
    roomsRouter = require('./routes/rooms'),
    bookingsRouter = require('./routes/bookings'),
    adminRouter = require('./routes/admin');

// Set up the app
var app = express();

// Connect to MySQL
app.use(myConnection(mysql, {
  host: 'localhost',
  user: 'student',
  password: 'serverSide',
  port: 3306,
  database: 'student'
}, 'single'));

// Use sessions
app.use(session({
  secret: "FDSfaeo78rafrgf7earh78hr78g",
  resave: false,
  saveUninitialized: true
}));

// Define bodyparser (handles POST requests)
app.use(bodyParser.urlencoded({extended: true}));

// Define the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Tell express which static files to serve
app.use(express.static('public'));

function authChecker(req, res, next){
  if (req.session.username){
    res.locals.loggedIn = true;
    res.locals.username = req.session.username;
  } else{
    res.locals.loggedIn = false;
  }

  if (req.session.admin){
    res.locals.admin = true;
  } else{
    res.locals.admin = false;
  }
  next();
}

app.use(authChecker);

// Connect the routers to routes
app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter);
app.use('/rooms', upload.single('file'), roomsRouter);
app.use('/admin', adminRouter);

app.get('/', function(req, res){
  res.redirect('/rooms');
})

app.get('*', function(req, res, next) {
  if (req.session.username){
    res.locals.loggedIn = true;
  } else{
    res.locals.loggedIn = false;
  }
  res.render('404');
});

// Tell the app to listen to incoming traffic on port 3000
app.listen(3000, function(){
  console.log("Started on port 3000");
});
