const express = require("express");
const router = express.Router();
const AmazonController = require('../controllers/amazon_controller');

router.get('/api/:name', AmazonController.ApiData);
module.exports = router;