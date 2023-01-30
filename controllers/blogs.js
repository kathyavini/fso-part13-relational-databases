const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { Blog, User } = require('../models');
const { SECRET } = require('../util/config');

const blogFinder = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      attributes: { exclude: ['userId'] },
      include: {
        model: User,
        attributes: ['name'],
      },
    });
    if (blog === null) {
      const error = new Error(`Resource not found: ${req.originalUrl}`);
      error.statusCode = 404;
      return next(error);
    }
    req.blog = blog;
    next();
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
};

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
  });
  res.json(blogs);
});

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

router.post('/', tokenExtractor, async (req, res, next) => {
  console.log('POST route received token:', req.decodedToken);
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const blog = await Blog.create({ ...req.body, userId: user.id });
    res.json(blog);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

router.delete('/:id', tokenExtractor, blogFinder, async (req, res, next) => {
  console.log('req.blog', req.blog);
  console.log('req.decodedToken', req.decodedToken);

  if (req.blog.userId !== req.decodedToken.id) {
    const error = new Error('blog entry can only be deleted by contributor');
    error.statusCode = 403;
    return next(error);
  }
  try {
    await req.blog.destroy();
    res.json({ deleted: req.blog });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
