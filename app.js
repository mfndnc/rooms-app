// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
const mongoose = require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'rooms-app';
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with Ironlauncher`;

// ******* for authentication
// npm install express-session connect-mongo bcrypt passport passport-local passport-facebook
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('./models/Users');
const LocalStrategy = require('passport-local').Strategy;
// ******* for authentication END

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (username, password, done) => {
      console.log('LocalStrategy', username);
      User.findOne({ email: username })
        .then((user) => {
          console.log('LocalStrategy findOne', user);
          if (user === null) {
            return done(null, false, { message: 'Wrong Credentials' });
          } else if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Wrong Credentials' });
          } else {
            return done(null, user);
          }
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

/*
 ******
 ****** saving sessions in local
 ******
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

// this is used to retrieve the user by it's id (that is stored in the session)
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((dbUser) => {
      done(null, dbUser);
    })
    .catch((err) => {
      done(err);
    });
});

app.use(passport.initialize());
app.use(passport.session());

/*
 ******
 ******
 ******
 */

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

app.use('/', require('./routes/auth'));

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
