const express = require('express');
const router = express.Router();
const authControl = require ('../controllers/authcontroller')
const userControl = require('../controllers/usercontroller')

router.route('/signup').post(authControl.signUp);

router.route('/login').post(authControl.login);

router.route('/forgot-password').post(authControl.forgotPassword)

router.route('/reset-password/:token').patch(authControl.resetPassword)

router.route('/update-password').patch(authControl.protect,authControl.updatePassword);

router.route('/update-user').patch(authControl.protect, userControl.updateMe);

router.route('/delete-user').delete(authControl.protect, userControl.deleteMe)


// const getAllUsers  =   (req,res) =>{
//     res.status(500).json({status : "Failed" , message: "Route not yet defined"})
//   }

//   const getUser  =   (req,res) =>{
//    res.status(500).json({status : "Failed" , message: "Route not yet defined"})
//  }

//  const createUser  =   (req,res) =>{
//    res.status(500).json({status : "Failed" , message: "Route not yet defined"})
//  }

//  const updateUser  =   (req,res) =>{
//    res.status(500).json({status : "Failed" , message: "Route not yet defined"})
//  }

//  const deleteUser  =   (req,res) =>{
//    res.status(500).json({status : "Failed" , message: "Route not yet defined"})
//  }

 router.route('/getAllUsers').get(userControl.getAllUsers)

// router.route('/:id').get( getUser).patch( updateUser).delete(deleteUser );

module.exports = router;
