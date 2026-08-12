const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const auth = require("../auth");
console.log(auth);

const { errorHandler } = auth;

module.exports.addBlog = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({
      message: "User is not authorized to execute this action",
    });
  }

  let newBlog = new Blog({
    title: req.body.title,
    content: req.body.content,
    author: req.user.id,
  });

  return newBlog
    .save()
    .then((blog) => {
      return res.status(201).send(blog);
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getBlogs = (req, res) => {
  return Blog.find()
    .populate("author", "username")
    .then((blogs) => {
      if (blogs.length > 0) {
        return res.status(200).send({ blogs });
      }
      return res.status(404).send({
        message: "Blogs is empty or not found",
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getMyBlogs = (req, res) => {
  return Blog.find({ author: req.user.id })
    .populate("author", "username")
    .then((blogs) => {
      if (blogs.length > 0) {
        return res.status(200).send({ blogs });
      }
      return res.status(404).send({
        message: "Blogs is empty or not found",
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getBlog = (req, res) => {
  return Blog.findById(req.params.id)
    .populate("author", "username")
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({
          message: "Blog not found",
        });
      }

      return res.status(200).send(blog);
    })
    .catch((err) => {
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};

module.exports.updateBlog = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      if (blog.author.toString() !== req.user.id) {
        return res.status(403).send({
          message: "User is not the author of this blog",
        });
      }

      const updates = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.content !== undefined) updates.content = req.body.content;

      return Blog.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      }).then((updatedBlog) => {
        return res.status(200).send({
          message: "Blog updated successfully",
          updatedBlog,
        });
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.deleteBlog = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      const isAuthor = blog.author.toString() === req.user.id;
      const isAdmin = req.user.isAdmin === true;

      if (!isAuthor && !isAdmin) {
        return res.status(403).send({
          message: "User is not authorized to delete this blog",
        });
      }

      return Blog.findByIdAndDelete(req.params.id)
        .then(() => Comment.deleteMany({ blog: req.params.id }))
        .then(() => {
          return res.status(200).send({
            message: "Blog and associated comments deleted successfully",
          });
        });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.likeBlog = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      const alreadyLiked = blog.likes.some(
        (userId) => userId.toString() === req.user.id,
      );

      if (alreadyLiked) {
        return res.status(400).send({ message: "You already liked this blog" });
      }

      blog.likes.push(req.user.id);

      return blog.save().then(() => {
        return res.status(200).send({
          message: "Blog liked successfully",
          likes: blog.likes.length,
        });
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.unlikeBlog = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      blog.likes = blog.likes.filter(
        (userId) => userId.toString() !== req.user.id,
      );

      return blog.save().then(() => {
        return res.status(200).send({
          message: "Blog unliked successfully",
          likes: blog.likes.length,
        });
      });
    })
    .catch((err) => errorHandler(err, req, res));
};
