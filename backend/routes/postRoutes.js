const express = require('express');
const authmiddleware = require('../middleware/authmiddleware');
const { createPost, getPosts } = require('../controllers/postController');
const router = express.Router();
const { getPostsById } = require('../controllers/postController');


router.post("/", authmiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPostsById);

module.exports = router;