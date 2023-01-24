const router = require('express').Router();

const { Blog } = require('../models');

const blogFinder = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
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
  const blogs = await Blog.findAll();
  res.json(blogs);
});

router.post('/', async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
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

router.delete('/:id', blogFinder, async (req, res, next) => {
  try {
    await req.blog.destroy();
    res.json({ deleted: req.blog });
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

module.exports = router;
