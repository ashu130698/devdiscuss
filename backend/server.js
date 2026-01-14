//Import require libraries
const express = require("express");  //web framework for building apis 
const mongoose = require("mongoose");  // odm for mongodb
const cors = require("cors");  //Enables cross origin resourse sharing
require("dotenv").config();  //load varible from .env file into process.env

const app = express();

//Middleware
app.use(cors());   //also frontend diffrent origin to call backend
app.use(express.json());  //Parses incoming request from json

//connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error", err));

//Health endponts simply check to server is still alsive or not
app.get("/health", (req, res) => {
  res.send("ok");
});

//Starrt server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));