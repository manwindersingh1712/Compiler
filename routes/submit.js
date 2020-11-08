const express = require("express");

const controller = require("../controller/submit")

const router = express.Router();

router.post("/", controller.postSubmission);

module.exports = router;