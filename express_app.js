
const morgan=require('morgan');
const express=require('express');
const path = require("path")
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const { isAuthenticated } = require('./config/auth');
// Passport Config
require('./config/passport')(passport);


//importing the model we exported in models
const db = require('./models');
const viewspath = path.join(__dirname,"/views") 

//importing the routes we exported in routes
const electionroutes = require('./routes/election_admin/elections/electionroutes');
const positionroutes = require('./routes/election_admin/positions/positionsroutes');
const candidateroutes = require('./routes/election_admin/candidates/candidatesroutes');
const voter_rollroutes = require('./routes/election_admin/voter/voter_roll_routes');
const result_routes = require('./routes/election_admin/results/result_routes');
const systemadminroutes = require('./routes/system_admin/sysadminroutes');
//initialising express app
const app=express();
//middleware for url encoding
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//url for mysql database connection
db.sequelize.sync({ alter: true }).then(
  function(){
    //listen for request
  
    app.listen(3000);
    console.log('connected!!! up and running!');
  
  }).
  catch(function(err){
  
    console.log(err);
  });




//Passport related config
// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

//app.use(session({secret: 'secret', saveUninitialized: true, resave: true, cookie: { secure: true }}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables


app.use(function(req, res, next) {
  res.locals.fname = req.session.fname;;
  res.locals.lname = req.session.lname;
  res.locals.role = req.session.role;
  res.locals.uid = req.session.uid;
  next();
});

//initialising morgan
app.use(morgan('dev'));

//route to dafault page
app.get('/',function(req,res){
  var error_s="";

  const lerror = req.flash('error')
  if(lerror.length>0)
  {
    error_s="set";
  }

  res.render('../views/login/login1',{error_s})
 });
//adding routes per module

app.use('/election',electionroutes); 
app.use('/position',positionroutes); 
app.use('/candidate',candidateroutes); 
app.use('/voter',voter_rollroutes);
app.use('/result',result_routes);
app.use('/user',systemadminroutes);
 
//midlle ware static
app.set("views", viewspath)

app.use(express.static(__dirname + '/public'))
//register ejs  (view engine)
app.set('view engine','ejs');
app.use(expressLayouts);