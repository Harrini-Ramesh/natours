const dotenv = require('dotenv')
dotenv.config({path: './.env'})
const app = require('./app');
const mongoose = require('mongoose');



const port = process.env.PORT || 3000;

const db_url = process.env.DATABASE_URL

mongoose.connect(db_url )
    .then(
    () => console.log("Database Connected"),
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    })
  )


