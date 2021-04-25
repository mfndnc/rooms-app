module.exports = (hbs) => {
  hbs.registerHelper('isOwner', function (room, user, opts) {
    if (room && user && String(room.owner) == String(user._id))
      return opts.fn(this);
    else return opts.inverse(this);
  });
};
