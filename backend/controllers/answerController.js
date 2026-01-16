const { error } = require("console");
const Answer = require("../models/answer");

exports.addAnswer = async (req, res) => {
    try {
        const { body } = req.body;
        const postId = req.params.id;

        if (!body) {
            return res.status(400).json({ error: "Answer body required" });
        }

        const answer = await Answer.create({
            body,
            post: postId,
            author: req.user.userId
        });
        res.status(500).json(answer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add answer" });
    }
};

exports.getAnswers = async (req, res) => {
    try {
        const answers = await Answer.find({ post: req.params.id })
            .populate("author", "name email")
            .sort({ createdAt: -1 });
    } catch (err) {
        
        res.status(500).json({ json: "Failed to fetch answers" });
    }
}