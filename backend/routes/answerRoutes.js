const express = require('express');
const router = express.Router();
const { addAnswer, getAnswers, deleteAnswer } = require("../controllers/answerController");
const authmiddleware = require("../middleware/authmiddleware");


router.post("/posts/:id/answers", authmiddleware, addAnswer);
router.get("/posts/:id/answers", getAnswers);
router.delete("/answers/:id", authmiddleware, deleteAnswer);


module.exports = router;