const express = require('express');
const quizController = require('../controllers/quizController');
const router = express.Router();

// Route for generating a quiz
router.post("/generate-quiz", quizController.generateQuiz);

module.exports = router;