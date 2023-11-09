var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const jwt = require('jsonwebtoken');
var logger = require('morgan');

require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const adminRouter = require("./routes/admin")
/* const appointmentRouter = require('./routes/appointments'); */
const mongoose = require('mongoose');
var app = express();


//create connection and converted local host to 127.0.0.1 see mongod.cfg
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Mongoose connected to', mongoose.connection.host);
    
  }catch (error) {
    console.log(error)
  }


}


main();


/* app.use(cors()) */

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
})); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/user');

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromExtractors([(req) => {
    return req?.cookies?.jwt;
}]);
opts.secretOrKey = process.env.S_KEY;

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
   console.log("this is the opts", opts)
  try {
        const user = await User.findOne({_id: jwt_payload.id, role: jwt_payload.role});
        console.log("Finding user with ID:", jwt_payload.id, jwt_payload.role);
        console.log("Decoded JWT Payload:", jwt_payload);

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        console.error('Error in JWT strategy:', err);
        return done(err, false);
    }
}));

app.use(passport.initialize()); // Initialize passport
 // Initialize passport


//routers
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/admin", adminRouter)




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
