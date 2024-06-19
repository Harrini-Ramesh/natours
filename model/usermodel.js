const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require ('crypto')

const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required :[true, "Name is required field"]
    },
    email: {
        type: String,
        required :[true, "Name is required field"],
        unique: true,
        lowercase: true,
        //  validate :[validator.isEmail, 'please provide valid email']

    },
    photo: String,

    role : {
        type : String,
        enum : ['user', 'guide', 'leadguide', 'admin'],
        default :"user"
    },
    password:{
        type: String,
        required : [true, 'A password is required'],
        minLength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required : [true, 'A password is required'],
        minLength: 8,
        validate: {
            validator : function(el){
                return el === this.password
            }
        }


    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    PasswordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }

})

userSchema.pre('save', async function(next){

    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    console.log(this.password)
   
    this.passwordConfirm = undefined;
   
    next();
   })

   userSchema.methods.correctPassword= async function (candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
   }

   userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.PasswordResetExpires = Date.now() + 10*60 *1000;


    console.log("######",resetToken, this.passwordResetToken);
    return resetToken;

   }

   userSchema.pre(/^find/, function(next){
    this.find({ active : { $ne : false}})
    next();
  })

   userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now();
    next();
   })



const User = mongoose.model('User', userSchema);



module.exports = User;