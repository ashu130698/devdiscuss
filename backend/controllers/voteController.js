const Vote = require("../models/vote");
const Post = require("../models/post");

/**
 * POST /posts/:id/vote
 * Body: { value: 1 | -1 }
 *
 * Toggle logic:
 *  - If user has no vote → create vote
 *  - If user clicks the same vote again → remove vote (toggle off)
 *  - If user clicks opposite vote → update to new value
 */
exports.castVote = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const { value } = req.body;

    // Validate value
    if (![1, -1].includes(value)) {
      return res.status(400).json({ error: "Value must be 1 or -1" });
    }

    // Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Find existing vote by this user on this post
    const existingVote = await Vote.findOne({ user: userId, post: postId });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote clicked again → remove it (toggle off)
        await existingVote.deleteOne();
      } else {
        // Opposite vote → update
        existingVote.value = value;
        await existingVote.save();
      }
    } else {
      // No existing vote → create new
      await Vote.create({ user: userId, post: postId, value });
    }

    // Return updated vote summary
    const summary = await getVoteSummary(postId, userId);
    res.json(summary);
  } catch (err) {
    console.error("CAST VOTE ERROR:", err);
    res.status(500).json({ error: "Failed to cast vote" });
  }
};

/**
 * GET /posts/:id/votes
 * Returns { score, userVote } for a single post
 */
exports.getVotes = async (req, res) => {
  try {
    const postId = req.params.id;
    // userId may be null if not authenticated
    const userId = req.user ? req.user.userId : null;

    const summary = await getVoteSummary(postId, userId);
    res.json(summary);
  } catch (err) {
    console.error("GET VOTES ERROR:", err);
    res.status(500).json({ error: "Failed to get votes" });
  }
};

/**
 * GET /posts/votes/bulk?ids=id1,id2,id3
 * Returns vote summaries for multiple posts at once (used by Posts list)
 */
exports.getBulkVotes = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(",") : [];
    const userId = req.user ? req.user.userId : null;

    if (ids.length === 0) {
      return res.json({});
    }

    // Aggregate scores for all requested posts
    const scorePipeline = await Vote.aggregate([
      { $match: { post: { $in: ids.map((id) => require("mongoose").Types.ObjectId.createFromHexString(id)) } } },
      { $group: { _id: "$post", score: { $sum: "$value" } } },
    ]);

    // Build a map of postId -> score
    const scoreMap = {};
    scorePipeline.forEach((entry) => {
      scoreMap[entry._id.toString()] = entry.score;
    });

    // Get user's votes if logged in
    const userVoteMap = {};
    if (userId) {
      const userVotes = await Vote.find({
        user: userId,
        post: { $in: ids },
      });
      userVotes.forEach((v) => {
        userVoteMap[v.post.toString()] = v.value;
      });
    }

    // Build result
    const result = {};
    ids.forEach((id) => {
      result[id] = {
        score: scoreMap[id] || 0,
        userVote: userVoteMap[id] || 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("BULK VOTES ERROR:", err);
    res.status(500).json({ error: "Failed to get votes" });
  }
};

/**
 * Helper: get vote summary for a single post
 */
async function getVoteSummary(postId, userId) {
  // Sum all vote values for this post
  const result = await Vote.aggregate([
    { $match: { post: require("mongoose").Types.ObjectId.createFromHexString(postId) } },
    { $group: { _id: null, score: { $sum: "$value" } } },
  ]);

  const score = result.length > 0 ? result[0].score : 0;

  // Get current user's vote (0 if none)
  let userVote = 0;
  if (userId) {
    const vote = await Vote.findOne({ user: userId, post: postId });
    if (vote) userVote = vote.value;
  }

  return { score, userVote };
}
