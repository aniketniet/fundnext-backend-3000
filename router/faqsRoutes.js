const express = require('express');
const router = express.Router();
const faqsController = require('../controller/faqsController');
const { middleware } = require('../middleware/jwtmiddleware');


router.get('/faq', middleware, faqsController.getFAQs);

module.exports = router;
