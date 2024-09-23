const { getrole } = require('../controller/check');

const router = require('express').Router();

router.get('/role', getrole);

module.exports = router;