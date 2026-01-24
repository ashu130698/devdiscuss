const express = require("express");
const authmiddleware = require("../middleware/authmiddleware");
const {
  createPost,
  getPosts,
  deletePost,
} = require("../controllers/postController");
const router = express.Router();
const { getPostsById } = require("../controllers/postController");

router.post("/", authmiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPostsById);
router.delete("/:id", authmiddleware, deletePost);

module.exports = router;
