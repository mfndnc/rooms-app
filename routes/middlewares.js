const alreadyLogged = () => {
  return (req, res, next) => {
    // not a page for who is logged
    if (req.isAuthenticated()) {
      // req.session.user // req.user
      res.redirect('/private');
    } else {
      next();
    }
  };
};
const loginCheck = () => {
  return (req, res, next) => {
    // check if the user is logged in
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login');
    }
  };
};

module.exports = {
  alreadyLogged,
  loginCheck,
};
