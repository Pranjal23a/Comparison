const express = require("express");
const router = express.Router();

const FlipkartController = require('../controllers/flipkart_controller');

router.get('/api/:name', FlipkartController.ApiData);

module.exports = router;