const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();

const bcrypt = require("bcryptjs");
const { isLoggedIn, verify, verifyAdmin } = require("../auth");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/check-email", userController.checkEmailExists);
router.get("/details", verify, userController.getProfile);
router.get("/all", verify, verifyAdmin, userController.getAllUsers);
router.patch(
  "/toggle-admin/:id",
  verify,
  verifyAdmin,
  userController.toggleAdmin,
);

module.exports = router;
