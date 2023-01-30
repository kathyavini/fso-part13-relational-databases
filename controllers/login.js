const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { SECRET } = require('../util/config');
const User = require('../models/user');

router.post('/', async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
    logging: console.log,
  });

  const passwordCorrect = req.body.password === 'secret';

  if (!(user && passwordCorrect)) {
    const error = new Error('invalid username or password');
    error.status = 401;
    return next(error);
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  console.log(userForToken);
  const token = jwt.sign(userForToken, SECRET);

  res.status(200).json({ token, username: user.username, name: user.name });
});

module.exports = router;
