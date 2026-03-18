const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      enum: [1, -1], // 1 = upvote, -1 = downvote
    },
  },
  { timestamps: true }
);

// Each user can only have one vote per post
voteSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
