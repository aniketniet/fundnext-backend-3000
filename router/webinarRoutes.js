const express = require('express');
const router = express.Router();
const webinarController = require('../controller/webinarController');
const { middleware } = require('../middleware/jwtmiddleware');


router.post('/webinar', middleware, webinarController.createWebinar);

module.exports = router;
