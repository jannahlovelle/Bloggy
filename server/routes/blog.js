const express = require("express");
const blogController = require("../controllers/blog");
const router = express.Router();

const bcrypt = require("bcryptjs");
const { isLoggedIn, verify } = require("../auth");

router.post("/", verify, blogController.addBlog);
router.get("/", blogController.getBlogs);
router.get("/myBlogs", verify, blogController.getMyBlogs);
router.get("/:id", blogController.getBlog);
router.patch("/:id", verify, blogController.updateBlog);
router.patch("/:id/like", verify, blogController.likeBlog);
router.patch("/:id/unlike", verify, blogController.unlikeBlog);
router.delete("/:id", verify, blogController.deleteBlog);

module.exports = router;
