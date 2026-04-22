const express = require('express');
const { handleChat } = require('../controllers/chatbot');
const router = express.Router();

router.post('/', handleChat);

module.exports = router;
