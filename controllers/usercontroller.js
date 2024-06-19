const ErrorHandler = require('../utils/errorHandler');
const User = require('./../model/usermodel');

const filterObj = (obj, ...allowedFields) =>{
 const newObj = {};
 Object.keys(obj).forEach(el =>{
  if(allowedFields.includes(el)){ newObj[el] = obj[el]} 
 })
 return newObj;
}

const getAllUsers = async (req, res) => {


try{

   const users = await User.find();


   res.status(200).json({
      status: 'success',
      results : users.length,
      data: {
        users
      }
    });

   } catch(err){
      res.status(400).json({status : "Failed" , error: 'Invalid data'});
      console.log(err);
  }

   }

  const getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  const createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  const updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  const deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };

  const updateMe = async(req,res,next) => {

    if(req.body.password || req.body.passwordConfirm){
      return next(new ErrorHandler('This route is not for password updates', 403))
    }
    const filteredBody = filterObj(req.body, 'name', 'email')

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true});
    res.status(200).json({status: "Success", updateUser});
  }

  

  const deleteMe = async(req,res,next) =>{
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({status: "Success", message: "Successfully deleted the user"});

  }

  module.exports = { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe}
  