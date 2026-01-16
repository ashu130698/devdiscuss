const express = require('express');
const authmiddleware = require('../middleware/authmiddleware');
const { createPost, getPosts } = require('../controllers/postController');
const router = express.Router();


router.post("/", authmiddleware, createPost);
router.get("/", getPosts);

module.exports = router;