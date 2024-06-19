const express = require('express');
const router = express.Router();
const tourControl = require('../controllers/tourcontroller');
const { route } = require('./userroutes');
const authControl = require('../controllers/authcontroller')


router.route('/getMonthlyPlan/:year').get(tourControl.getMonthlyPlan);

router.route('/route-stats').get(tourControl.getRoutsStats);



router.route('/top-cheap-routes').get(tourControl.getCheap,tourControl.getAllTours);

router.route('/').get(authControl.protect,tourControl.getAllTours).post(tourControl.createTour);

router.route('/:id').get( tourControl.getTour).patch( tourControl.updateTour).delete(authControl.protect,authControl.restrictTo('admin','leadguide'),tourControl.deleteTour );

module.exports = router;
 