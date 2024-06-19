const morgan = require('morgan');
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/userroutes')
const reviewRouter = require('./routes/reviewRoutes')

const express = require('express');
const app = express();
const ErrorHandler = require('./utils/errorHandler')
const globalErrorHandler = require('./controllers/errorcontroller')
const rateLimiter = require('express-rate-limit')


app.use(express.json());

app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

const limiter = rateLimiter({
    max:2,
    window: 60*60*1000,
    message: 'Too many request for this ip.Try again later after 1 hour'
})

app.use('/api', limiter);


app.use((req,res,next)=>{
    req.reqTime = new Date().toISOString();
    next();
})


app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);


app.all('*', (req,res,next) =>{
    

next(new ErrorHandler(`${req.url} not found`, 404) );
})

app.use(globalErrorHandler);


module.exports = app;
