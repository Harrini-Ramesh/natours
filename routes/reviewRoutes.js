const reviewController = require('./../controllers/reviewController')
const express = require('express');
const router = express.Router();
const authControl = require('../controllers/authcontroller')


router.route('/').get(reviewController.getAllReviews).post(authControl.protect,authControl.restrictTo('user'),reviewController.createReview)

module.exports = router;