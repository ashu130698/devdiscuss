const mongoose = require("mongoose");
const User = require("../models/user");

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  },
  { timeStamp: true },
);

module.exports = mongoose.model("Post", postSchema);
