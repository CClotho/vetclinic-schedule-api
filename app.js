require('dotenv').config();
const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const helmet = require('helmet');
const logger = require('morgan');
const mongoose = require('mongoose');

var app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected to', mongoose.connection.host))
  .catch((error) => console.error('MongoDB connection error:', error));

// Security middlewares
app.use(helmet()); // Set security-related HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Set your frontend's URL in the environment variable
  credentials: true,
}));


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

res.status(err.status || 500);
  res.json({ error: err.message });
});
// Logger
 if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));

 }
// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Passport JWT strategy
const User = require('./models/user');
const Client = require('./models/client');

let opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.jwt]),
  secretOrKey: process.env.S_KEY,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findOne({ _id: jwt_payload.id });
    if (!user) {
      return done(null, false);
    }

    if (jwt_payload.client) {
      const client = await Client.findOne({ _id: jwt_payload.client });
      if (!client) {
        // If client ID is in JWT but no client is found, just pass the user
        return done(null, user);
      }
      // Attach the client object directly to the user
      user.client = client;
    }

    // Directly pass the user object
    return done(null, user);

  } catch (err) {
    return done(err, false);
  }
}));


app.use(passport.initialize());

// Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const adminRouter = require("./routes/admin");
const clientRouter = require("./routes/client")
const sharedRouter = require('./routes/shared')

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/admin", adminRouter);
app.use("/client", clientRouter)
app.use("/service", sharedRouter)
// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




/*
// Error handler
app.use(function(err, req, res, next) {
  // Set locals, providing error only in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error'); // <-- This line is likely causing the issue
});

*/
// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});



module.exports = app;
