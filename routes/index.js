const express = require("express");
const router = express.Router();
const homeController = require('../controllers/home_controller');

console.log("Router loaded");
router.get('/', homeController.home);
router.use('/amazon', require('./amazon'));
router.use('/flipkart', require('./flipkart'));


module.exports = router;