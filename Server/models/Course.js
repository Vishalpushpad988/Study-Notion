const mongoose = require("mongoose");

const couseSchema = new mongoose.Schema({
    courseName :{
        type:String,
    },
    courseDescription:{
        type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    whatYouWillLearn:{
        type:String, 
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",   
        }
    ],
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReview",
    }],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String,
    },
    tag:{
        type:[String],
        require:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"user",
    }],
    instructions: {
        type: [String],
      },
      status: {
        type: String,
        enum: ["Draft", "Published"],
      },
      createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Course",couseSchema);