const mongoose = require("mongoose");
const SubSection = require("./SubSection");

const SectionSchema= new mongoose.Schema({
    sectionName:{
        type:String,
    },
    SubSection:[{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"SubSection",
        required: true
    }],
});

module.exports = mongoose.model("Section",SectionSchema);