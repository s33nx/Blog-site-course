const Blog = require('../models/blog')
// blog_index, blog_details, blog_create_get, blog_create_post, blog_delete

const sortOptions = {
  'newest': { createdAt: -1 },
  'oldest': { createdAt: 1 },
  'title-asc': { title: 1 },
  'title-desc': { title: -1 },
  'author-asc': { author: 1 },
  'author-desc': { author: -1 }
};

const blog_index = (req, res) => {
  const searchTerm =
    typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';

  const selectedDate =
    typeof req.query.date === 'string' ? req.query.date : '';

  const requestedSort =
    typeof req.query.sort === 'string' ? req.query.sort : 'newest';

  // Only allow sort keys listed in sortOptions.
  const selectedSort = Object.hasOwn(sortOptions, requestedSort)
    ? requestedSort
    : 'newest';

  const filter = {};

  // Search blog titles or author names, without treating input as regex syntax.
  if (searchTerm) {
    const searchRegex = new RegExp(escapeRegex(searchTerm), 'i');
    filter.$or = [
      { title: searchRegex },
      { author: searchRegex }
    ];
  }

  // Match blogs created during the selected UTC calendar day.
  if (selectedDate) {
    const validDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
    const start = new Date(`${selectedDate}T00:00:00.000Z`);
    const isRealDate =
      validDateFormat &&
      !Number.isNaN(start.getTime()) &&
      start.toISOString().slice(0, 10) === selectedDate;

    if (!isRealDate) {
      return res.status(400).send('Invalid date. Use YYYY-MM-DD.');
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    filter.createdAt = { $gte: start, $lt: end };
  }

  Blog.find(filter)
    .sort(sortOptions[selectedSort])
    .then((blogs) => {
      res.render('blogs/index', {
        title: 'All Blogs',
        blogs,
        selectedSort,
        searchTerm,
        selectedDate
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Could not load blogs.');
    });
}

const blog_details = (req, res) => {
     const id = req.params.id;
      Blog.findById(id)
      .then((result) => {
        if (!result) {
          return res.status(404).render('404', { title: '404' });
        }
        res.render('blogs/details', { blog: result, title: 'Blog Details' });
      })
      .catch((err) => {
        console.log(err);
        if (err.name === 'CastError') {
          return res.status(404).render('404', { title: 'Blog Not Found' });
        }
        res.status(500).send('Server error');
      })
}

const blog_create_get = (req, res) => {
    res.render('blogs/create', {title: 'Create Blog'});
}

const blog_create_post = (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
  .then((result) => {
    res.redirect('/blogs');
  })
  .catch((err) => {
    console.log(err);
  })
}
const blog_delete = (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
  .then((result) => {
    res.json({ redirect: '/blogs' });
  })
  .catch((err) => {
    console.log(err);
  });
};


module.exports = {
    blog_index,
    blog_details,
    blog_create_get,
    blog_create_post,
    blog_delete
}

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');