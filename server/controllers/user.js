const User = require("../models/User");
const bcrypt = require("bcryptjs"); // <<
const auth = require("../auth");
console.log(auth);

module.exports.loginUser = (req, res) => {
  return User.findOne({
    $or: [
      { email: req.body.emailOrUsername },
      { username: req.body.emailOrUsername },
    ],
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "Incorrect email/username or password",
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password,
      );

      if (!isPasswordCorrect) {
        return res.status(401).send({
          message: "Incorrect email/username or password",
        });
      }

      return res.status(200).send({
        access: auth.createAccessToken(user),
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};

module.exports.registerUser = (req, res) => {
  return User.findOne({ email: req.body.email })
    .then((result) => {
      if (result) {
        return res.status(409).send({
          message: "Email already exists",
        });
      }

      if (req.body.password.length < 6) {
        return res.status(400).send({
          message: "Password must be at least 6 characters long",
        });
      }
      let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        // isAdmin: req.body.isAdmin,
      });
      return newUser
        .save()
        .then((user) => {
          return res.status(201).send({
            message: "Registered Successfully",
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).send({
            message: "Register user failed",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};

module.exports.checkEmailExists = (req, res) => {
  return User.findOne({ email: req.body.email }).then((result) => {
    return res.send(result !== null);
  });
};

module.exports.getProfile = (req, res) => {
  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }
      user.password = undefined;

      return res.status(200).send(user);
    })
    .catch((err) => {
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};

module.exports.getAllUsers = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({
      message: "Access denied",
    });
  }

  return User.find()
    .select("-password")
    .then((users) => {
      if (users.length === 0) {
        return res.status(404).send({
          message: "No users found",
        });
      }
      return res.status(200).send({ users });
    })
    .catch((err) => {
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};

module.exports.toggleAdmin = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send({
      message: "Access denied",
    });
  }

  return User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      user.isAdmin = !user.isAdmin;
      return user.save().then((updatedUser) => {
        return res.status(200).send({
          message: `User ${updatedUser.username} is now ${updatedUser.isAdmin ? "an admin" : "not an admin"}`,
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({
        message: "Internal server error",
      });
    });
};
