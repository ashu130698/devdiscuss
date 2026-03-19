const Post = require("../models/post");

exports.createPost = async (req, res) => {
  try {
    // destructuring requiring title, body, and tags from request body
    const { title, body, tags } = req.body;
    
    // simple validation title must required
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (title.length < 5) {
      return res.status(400).json({ error: "Title too short" });
    }

    // Process tags: convert to array, trim, and lowercase
    let processedTags = [];
    if (tags && Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim().toLowerCase()).filter(t => t !== "");
    } else if (tags && typeof tags === 'string') {
      processedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== "");
    }

    // creating new post document in MongoDB
    const post = await Post.create({
      title,
      body,
      author: req.user.userId,
      tags: processedTags
    });

    res.status(201).json(post);
  } catch (err) {
    //always log full error in debugging
    console.error("CREATE POST ERROR:", err);
    //Never expose raw error to client(Security best practise)
    res.status(500).json({ error: "Failed to create post" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    //post.find fetches all posts
    //poulate is mongodb feature that replaces author ID
    //with actual user document containing name and email
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 }); //sort newest first

    res.json(posts);
  } catch (err) {
    console.error("GET POST ERROR:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

exports.getPostsById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email _id",
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ errror: "Failed to fetch post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    //only creator can delete
    if (post.author._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorised" });
    }

    await post.deleteOne();
    res.json({ message: "Post Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};
