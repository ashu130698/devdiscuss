const Post = require("../models/post");

exports.createPost = async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const post = new Post({
            title,
            body,
            author: userId
        });

        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error("CREATE POST ERROR:", err);
        res.status(500).json({ error: "Failed to create post" });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });
        
        res.json(posts);
    } catch (err) {
        console.error("GET POST ERROR:", err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};