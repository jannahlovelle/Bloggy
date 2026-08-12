const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const commentRoutes = require("./routes/comment");

mongoose.connect(process.env.MONGODB_STRING);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error"));
db.once("open", () => console.log("We're connected to the cloud database"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [process.env.VERCEL_URL, process.env.VITE_BLOG_API_URL],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/comments", commentRoutes);

if (require.main == module) {
  app.listen(process.env.PORT, () =>
    console.log(`Server is running at port ${process.env.PORT}`),
  );
}

module.exports = { app, mongoose };
