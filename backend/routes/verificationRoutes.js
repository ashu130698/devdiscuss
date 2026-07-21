const express = require("express");
const {
  getVerificationByAnswer,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/:answerId", getVerificationByAnswer);

module.exports = router;
