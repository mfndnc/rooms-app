const router = require('express').Router();
const Room = require('../models/Rooms');
const { loginCheck } = require('./middlewares');

router.get('/', loginCheck(), (req, res, next) => {
  Room.find()
    .then((rooms) => res.render('rooms/index', { rooms }))
    .catch((err) => next(err));
});

router.get('/add', loginCheck(), (req, res, next) => {
  res.render('rooms/add');
});

router.post('/add', loginCheck(), (req, res, next) => {
  const { name, description } = req.body;
  Room.create({
    name,
    description,
    owner: req.user._id,
  })
    .then(() => res.redirect('/rooms'))
    .catch((err) => next(err));
});

router.get('/:id', loginCheck(), (req, res, next) => {
  Room.findById(req.params.id)
    .then((room) => res.render('rooms/show', { room }))
    .catch((err) => next(err));
});

router.get('/:id/edit', loginCheck(), (req, res, next) => {
  // the other way is to query with findOne with room id and user id and redirect if result is empty
  // this way, we can elegantly show an error message
  Room.findById(req.params.id)
    .then((room) => {
      const canEdit = String(room.owner) == String(req.user._id);
      console.log('canEdit', canEdit, room.owner, req.user._id);
      res.render('rooms/edit', { room, canEdit });
    })
    .catch((err) => next(err));
});

router.post('/:id/edit', loginCheck(), (req, res, next) => {
  const { name, description } = req.body;
  Room.findByIdAndUpdate(req.params.id, {
    name,
    description,
  })
    .then(() => res.redirect(`/rooms/${req.params.id}`))
    .catch((err) => next(err));
});

router.get('/:id/delete', loginCheck(), (req, res, next) => {
  const query = { _id: req.params.id, owner: req.user._id };
  Room.findOneAndDelete(query)
    .then(() => res.redirect('/rooms'))
    .catch((err) => next(err));
});

module.exports = router;
