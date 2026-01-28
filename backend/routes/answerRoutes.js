const express = require("express");
const router = express.Router();
const {
  addAnswer,
  getAnswers,
  deleteAnswer,
} = require("../controllers/answerController");
const authmiddleware = require("../middleware/authmiddleware");

// answers as sub-resource of posts
router.post("/:id/answers", authmiddleware, addAnswer);
router.get("/:id/answers", getAnswers);
router.delete("/answers/:id", authmiddleware, deleteAnswer);

module.exports = router;
