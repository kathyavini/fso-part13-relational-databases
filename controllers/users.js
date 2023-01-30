const router = require('express').Router();

const { Blog, User } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll({
    //   include: {
    //     model: Blog,
    //     attributes: { exclude: ['userId'] },
    //   },
    logging: console.log,
  });
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    return res.status(400).json({ error: error.errors.map((x) => x.message) });
  }
});

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    user.username = req.body.username;
    await user.save();
    res.json(user);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

module.exports = router;
