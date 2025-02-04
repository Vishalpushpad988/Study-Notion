//Connection with the database

const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async ()=>{
    await mongoose.connect(process.env.MONGODB_URL,{})
     .then(console.log("DB connection successful"))
     .catch((error)=>{
         console.log("DB connection issue");
         console.error(error);
         process.exit(1); 
     });
 };