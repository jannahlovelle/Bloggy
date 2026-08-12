const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const auth = require("../auth");
console.log(auth);

const { errorHandler } = auth;

module.exports.addComment = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      const newComment = new Comment({
        blog: req.params.id,
        author: req.user.id,
        comment: req.body.comment,
      });

      return newComment.save().then((comment) => {
        return comment
          .populate("author", "username")
          .then((populatedComment) => {
            return res.status(201).send(populatedComment);
          });
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getComments = (req, res) => {
  return Blog.findById(req.params.id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send({
          message: "Blog not found",
        });
      }

      return Comment.find({ blog: req.params.id })
        .populate("author", "username")
        .then((comments) => {
          return res.status(200).send({ comments });
        });
    })
    .catch((error) => errorHandler(error, req, res));
};
