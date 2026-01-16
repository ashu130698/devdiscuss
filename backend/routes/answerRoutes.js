const express = require('express');
const router = express.Router();
const { addAnswer, getAnswers } = require("../controllers/answerController");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/posts/:id/answers", authmiddleware, addAnswer);
router.get("/posts/:id/answers", getAnswers);

module.exports = router;