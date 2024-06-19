const Review = require('./../model/reviewModel')


const getAllReviews = async(req,res) =>{
    const reviews = await Review.find();

    res.status(200).json({status : "success", result: reviews.length, data: {reviews}});

}

const createReview = async(req,res) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({status : "success", data: {newReview}});

}

module.exports = { getAllReviews, createReview}