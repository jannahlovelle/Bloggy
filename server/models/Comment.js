const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: [true, "Blog is Required"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is Required"],
  },
  comment: {
    type: String,
    required: [true, "Comment is Required"],
  },
});

module.exports = mongoose.model("Comment", commentSchema);
