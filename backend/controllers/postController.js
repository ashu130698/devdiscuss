const Post = require("../models/post");

exports.createPost = async (req, res) => {
  try {
    //destructuring requiring title and body from reqest body
    const { title, body } = req.body;
    //simple validation title must required
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (title.length < 5) {
      return res.status(400).json({ error: "Title to short" });
    }
    if (body && body.length > 5000) {
      return res.status(400).json({ error: "body too long" });
    }
    //creating new post document in MongoDB
    //req.user.userId comes jwt auth middleware
    const post = await Post.create({
      title,
      body,
      author: req.user.userId,
    });

    //sending created post back as response

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

    const post = await Post.findById(req.params.id)
      .populate("author", "name email");
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ errror: "Failed to fetch post" });
  }
};
