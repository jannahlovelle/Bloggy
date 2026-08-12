const express = require("express");
const CommentController = require("../controllers/comment");
const router = express.Router();

const { verify } = require("../auth");

router.post("/:id/addComment", verify, CommentController.addComment);
router.get("/:id", CommentController.getComments);
// router.patch("/:id", verify, CommentController.updateComment);
// router.delete("/:id", verify, CommentController.deleteComment);

module.exports = router;
