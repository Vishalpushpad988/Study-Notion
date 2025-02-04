const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

//createSection handler
exports.createSection = async (req,res)=>{
    try {
        
        //data fetch
        const {sectionName,courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //create section
        const newSection = await Section.create({sectionName});

        //update course with section ObjectID
        const UpdatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        .populate({
          path: "courseContent",
          populate: {
            path: "SubSection",
          },
        })
        .exec()        
        // return response 
        return res.status(200).json({
            success:true,
            message:"Section Created Successfully",
            UpdatedCourseDetails,
        })

    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"unable to create section",
            error:error.message, 
         });
    }
}

//updateSection handler
exports.updateSection = async (req,res)=>{
  try {
   

    // fetch data
    const { sectionId, sectionName, courseId } = req.body

    // validate
    if (!sectionId || !sectionName) {
        return res.status(400).json({
            success: false,
            message: "all fields are require"
        })
    }
    
    // update section
    const updatedSection = await Section.findByIdAndUpdate(
        { _id: sectionId },
        { sectionName },
        { new: true }
    )
    
    // console.log("ye rha updated Section",updatedSection)
    

    const course = await Course.findById(courseId)
        .populate({
            path: "courseContent",
            populate: {
                path: "SubSection"
            },
        })
        .exec();
        // console.log("....................going to up................")
        // console.log("UPDATED COURSE ....-> ",course);
    // return success response
    return res.status(201).json({
        success: true,
        message: "section updated successfully",
        data: course
    })

}catch (error) {
        return res.status(500).json({
           success:false,
           message:"unable to create section",
           error:error.message, 
        });
   } 
};

// deleteSection handler 

exports.deleteSection = async(req,res)=>{
    try {
        const { sectionId, courseId } = req.body
        await Course.findByIdAndUpdate(courseId, {
          $pull: {
            courseContent: sectionId,
          },
        })
        const section = await Section.findById(sectionId)
        console.log(sectionId, courseId)
        if (!section) {
          return res.status(404).json({
            success: false,
            message: "Section not found",
          })
        }
        // Delete the associated subsections
        await SubSection.deleteMany({ _id: { $in: section.SubSection } })
    
        await Section.findByIdAndDelete(sectionId)
    
        // find the updated course and return it
        const course = await Course.findById(courseId)
          .populate({
            path: "courseContent",
            populate: {
              path: "SubSection",
            },
          })
          .exec()
    
        res.status(200).json({
          success: true,
          message: "Section deleted",
          data: course,
        })
      } catch (error) {
        console.error("Error deleting section:", error)
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        })
      }
}