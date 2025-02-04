const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader")
const {convertSecondsToDuration} = require("../utils/secToDuration")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")

exports.updateProfile = async(req,res)=>{
    try {
        
        //fetch data
        const{dateOfBirth="",about="",contactNumber,gender} = req.body;
        //get userId
        const id = req.user.id;//ye decode me jo hame userId PSS ko thi wo hai

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All filed are required",
            });
        }
        //find profile
        //user ki details fetch using id
        const userDetails = await User.findById(id);
        //get the profile id using user details 
        const profileId = await userDetails.additionalDetails;
        //find the profileDetails using profileId
        const profileDetails = await Profile.findById(profileId);
        
        //Update Profile

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //find the updated user details
        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails").exec();
        //return response

        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            updatedUserDetails,
            
        });  

    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}

//Delete Account Handler
//explore - How can we schedule this deletion process

exports.deleteAccount = async(req,res)=>{
    try {
        //get id 
        const id = req.user.id;
        //validation 
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(401).json({
                success:false,
                message:"User not found",
            });
        }
        //sbse pehele profile delete kro and then user delete kro 

        //delete Profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //TODO : HW UNROLL USER FROM THE ENROLLED COURSES
        
        //delete user
        await  User.findByIdAndDelete({_id:id});

        // return response 
        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        });

    } catch (error) {
        return res.status(404).json({
            success:true,
            message:"User deleted Successfully",
        });

    }
}

exports.getAllUserDetails = async (req,res)=>{
    try {
        //get ID 
        const id = req.user.id;
        //validationa and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"User Data Fatched Successfully",
            data:userDetails
        });

    } catch (error) {
        return res.status(404).json({
            success:true,
            message:"Unable to fetch the data",
        });
    }
}


exports.updateDisplayPicture = async (req, res) => {
  try {

		const id = req.user.id;
	const user = await User.findById(id);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.pfp;
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);
	// console.log(uploadDetails);

	const updatedImage = await User.findByIdAndUpdate({_id:id},{image:uploadDetails.secure_url},{ new: true });

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}

}


  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "SubSection",
            },
          },
        })
        .exec()

        // console.log("USER DETAILS -->",userDetails)
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].SubSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].SubSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  
  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json(
        { 
          success:true,
          courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }

