const Tour = require('../model/tourmodel');
const APIFeatures = require('../utils/apifeatures');
const ErrorHandler = require('../utils/errorHandler');

const getCheap = (req,res,next) =>{
    req.query.limit =5;
    req.query.sort = 'price';
    next();
}

const getRoutsStats = async(req,res)=>{
    try{
        const stats = await Tour.aggregate([
            {
                $match : { ratingsAverage : { $gte: 2}}
            },
            {
                $group :{
                    _id: null,
                    numTours : { $sum : 1},
                    avgRating : { $avg: '$ratingsAverage'},
                    avgPrice : { $avg: '$price'},
                    minPrice : { $min: '$price'},
                    maxPrice : { $max: '$price'}

                }
            }
        ])

        res.status(200).json({status : "Success", result: stats.length, message: stats })


    }catch(err){
        res.status(400).json({status : "Failed" , error: 'Invalid data'});
        console.log(err);
    }
}

const getMonthlyPlan = async(req,res) =>{
    try{
        const year = req.params.year *1;
        console.log(year);
        const plan = await  Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(`$(year)-01-01`),
                        $lte : new Date(`$(year)-12-31`),
                    }
                }
            }
        ])

        res.status(200).json({status : "Success", result: plan.length, message: plan })

    }catch(err){
        res.status(400).json({status : "Failed" , error: 'Invalid data'});
        console.log(err);
    }
}

const getAllTours =  async(req,res) =>{
    try{
        
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().pagination();
 
        const tour  = await features.query;

        res.status(200).json({status : "Success", result: tour.length, message: tour })

    }catch(err){
        res.status(400).json({status : "Failed" , error: 'Invalid data'});
        console.log(err);
    }

   }
 
 const createTour =  async(req,res) => {

    try {

     const newTour = await Tour.create(req.body);
     console.log(newTour);


     res.status(200).json({status : "Success" , data: newTour});

    } catch(err) {

      console.log(err);
    
      res.status(400).json({status : "Failed" , error: err.message});

    }

    
 }

 
 
 const getTour = async(req,res,next) =>{

    try{
     
        const tour = await Tour.findById(req.params.id).populate('review')
        console.log("$$$$$",tour)

        if(!tour){
            return next(new ErrorHandler('No tour found with that id', 404));
        }

          res.status(200).json({status : "Success", message: tour   })
  
      }catch(err){
        console.log(err);
          res.status(400).json({status : "Failed" , error: 'Invalid data'});
      }
  
 }
 
 const updateTour =  async(req,res,next) =>{

    try{
        const tour = await Tour.findByIdAndUpdate( req.params.id, req.body, {new: true, runValidators: true})

          res.status(200).json({status : "Success", message: tour  })

          if(!tour){
            return next(new ErrorHandler('No tour found with that id', 404));
        }
  
      }catch(err){
          res.status(400).json({status : "Failed" , error: 'Invalid data'});
      }
 }
 
 const deleteTour = async(req,res,next) =>{
    try{
          const tour = await Tour.findByIdAndDelete( req.params.id)

          if(!tour){
            return next(new ErrorHandler('No tour found with that id', 404));
        }
        
          res.status(200).json({status : "Success", message: "Successfully Deleted the record"  })
  
      }catch(err){
          res.status(400).json({status : "Failed" , error: 'Invalid data'});
      }
    
 }

 module.exports = {  getAllTours ,createTour, getTour, updateTour, deleteTour, getCheap, getRoutsStats
    , getMonthlyPlan
 };