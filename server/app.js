require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("query parser", "extended");

app.use(cors());

app.use(router);

app.use(errorHandler);

module.exports = app;
