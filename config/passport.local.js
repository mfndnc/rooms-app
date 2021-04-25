const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('../models/Users');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (app) => {
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
};
