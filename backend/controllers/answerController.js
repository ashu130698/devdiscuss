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
        
        res.json(answers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ json: "Failed to fetch answers" });
    }
};

exports.deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id)
            .populate("author", "name email");
        
        if (!answer) {
            return res.status(404).json({ error: "Answer not found" });
        }
        //only creater can delete
        if (answer.author._id.toString() !== req.user.userId) {
          return res.status(403).json({ error: "Not Allowed" });
        }
        await answer.deleteOne();

        res.json({ message: "Answer deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete answer" })
    }
};