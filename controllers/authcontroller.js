const ErrorHandler = require('../utils/errorHandler');
const User = require('./../model/usermodel');
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const sendMail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
 return jwt.sign({id: id},process.env.JWT_SECRET,{ expiresIn : process.env.JWT_EXPIRESIN} )

}

const createSendToken = (res,statusCode,user) =>{

    const token = signToken(user._id);

    //send cookies
    const cookieOptions = { expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIN *24 *60 *60),
       httpOnly: true}

    res.cookie('jwt', token, cookieOptions)

    if(process.env.NODE_ENV == 'production') { cookieOptions.secure=true}

    res.status(statusCode).json({status : "Success",token, data : {user: user}  });

}


const signUp = async (req,res) =>{
    try{
        
        const newUser = await User.create({
      
        name : req.body.name,
        email: req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm
        })

        createSendToken(res,201,newUser);

   

    }
    
    catch(err){
        console.log(err);

        res.status(400).json({status : "Failed" , error: 'Invalid data'});

    }
}


const login = async  (req,res,next)=>{

    try {

        const { email,password} = req.body;

        //If email or password is not there

        if(!email || !password){
           return  next (new ErrorHandler('Please provide email and password', 400));

        }
    // check if the user and password is correct

        const user = await User.findOne({email}).select('+password');
    
    if(!user ||! (await user.correctPassword(password, user.password))){

        return  next (new ErrorHandler('Incorrect password or email', 401));
  
    }
    createSendToken(res,200,user);

    

    }catch(err){
        res.status(400).json({status : "Failed" , error: 'Invalid data'});
        console.log(err); 

    }
   
}

const protect = async(req,res,next) =>{

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        //  console.log(token);

    }
    if(!token){
        return  next (new ErrorHandler('Please login correctly with credentials', 400));
    }

    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded)
    

    // If current user does not exist 
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new ErrorHandler('User no longer exist',401))
    }

    //Grant access to protected route

    req.user = currentUser;
    console.log(req.user)


    next();
}

const restrictTo = (...roles) =>{
    return (req,res,next) => {
        console.log(req.user)
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler('You do not have the permission to perform this action',403))
 
        }
        next();
    }
}

const forgotPassword = async(req,res,next) =>{
    console.log(req.body.email);



    const user = await User.findOne({email : req.body.email});
    console.log(user);


    if(!user){
        return next(new ErrorHandler('There is no user with this email address',403))
 
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetURL);
    const message = `Forgot your password ? submit a request with new password and passwordconfirm to ${resetURL}.If you didn't forgot your password please ignore it`

    try {
        await sendMail ({
            email : user.email,
            subject : 'password reset token valid for 10 mins',
            message
            })

            res.status(200).json({ status: "success", message : "Token sent to mail" })


    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.log(err);

        return next(
            new ErrorHandler('There was an error sending the email. Try again later!'),
            500
          );

    }
    
}

const resetPassword = async(req,res,next) =>{
    //get the user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken);
    const user = await User.findOne({passwordResetToken: hashedToken })   
    console.log(user); 
    //if token not expired and there is user set new pwd
      if(!user){
        return next (new ErrorHandler('Token is invalid or expired', 400))
      }
      user.password = req.body.password;
      console.log("#####",user.email);

      user.passwordConfirm = undefined;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({validateBeforeSave: false});

      //update changedPasswordAt property for user in model
    
      //log in the user send jwt
      createSendToken(res,200,user);

      
  
    
}

const updatePassword = async(req,res,next) =>{
    //get user from collection
    const user = await User.findById(req.user.id).select('+password');

    if(!await user.correctPassword(req.body.passwordCurrent, user.password)){
        return next(new ErrorHandler('Your current password is wrong.', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm
    await user.save();

    createSendToken(res,200,user);

}






    

module.exports = {signUp, login, protect,restrictTo,forgotPassword,resetPassword,updatePassword }

