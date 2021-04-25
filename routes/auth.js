const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/Users');
const bcrypt = require('bcrypt');

const { alreadyLogged, loginCheck } = require('./middlewares');

router.get('/login', alreadyLogged(), (req, res, next) => {
  console.log('hello from login');
  res.render('auth/login');
});

router.get('/signup', alreadyLogged(), (req, res, next) => {
  res.render('auth/signup');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/private',
    failureRedirect: '/login',
    passReqToCallback: true,
  })
);

// if you need more control and also want to set an error message
// router.post('/login', (req, res, next) => {
//   passport.authenticate('local', (err, theUser, failureDetails) => {
//     console.log('Inside passport.authenticate', err, theUser, failureDetails);
//     if (err) {
//       // Something went wrong authenticating user
//       return next(err);
//     }
//     if (!theUser) {
//       // Unauthorized, `failureDetails` contains the error messages from our logic in "LocalStrategy" {message: '…'}.
//       return res.render('auth/login', {
//         message: 'Wrong password or username',
//       });
//     }
//     // save user in session: req.user
//     req.login(theUser, (err) => {
//       if (err) {
//         // Session save went bad
//         return next(err);
//       }
//       // All good, we are now logged in and `req.user` is now set
//       res.redirect('/');
//     });
//   })(req, res, next);
// });

router.post('/signup', (req, res, next) => {
  const { email, password, fullName } = req.body;
  if (password.length < 8) {
    return res.render('signup', {
      message: 'Your password has to be 8 chars min',
    });
  }
  if (email === '' || password === '' || fullName === '') {
    return res.render('signup', {
      message: 'Please fill in all obligatory fields',
    });
  }
  User.findOne({ email }).then((user) => {
    if (user !== null) {
      res.render('signup', { message: 'This email is already taken' });
    } else {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);
      User.create({ fullName, email, password: hash }).then((createdUser) => {
        req.login(createdUser, (err) => {
          if (err) {
            next(err);
          } else {
            res.redirect('/private');
          }
        });
      });
    }
  });
});

router.get('/private', loginCheck(), (req, res) => {
  res.render('auth/private', { user: req.user });
});

module.exports = router;
