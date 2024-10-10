require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

// view engine
app.set("view engine", "ejs");

connectDB();

app.use(authRoutes);

app.use((req, res) => res.status(404).render("404page"));
module.exports = app;
app.listen(PORT, () => {
  console.log(`App's listening on port ${PORT}`);
});
