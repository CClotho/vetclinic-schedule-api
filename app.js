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
let opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.jwt]),
  secretOrKey: process.env.S_KEY,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findOne({ _id: jwt_payload.id, role: jwt_payload.role });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));

app.use(passport.initialize());

// Routes
var indexRouter = require('./api/index');
var usersRouter = require('./api/users');
const adminRouter = require("./api/admin");

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/admin", adminRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, providing error only in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
