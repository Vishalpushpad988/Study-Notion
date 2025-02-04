const mongoose = require("mongoose");
// finding the instance of razorPay
const { instance } = require("../config/razorPay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const CourseProgress = require("../models/CourseProgress")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const crypto = require("crypto");

//capture the payments and initiate the RazorPay order

exports.capturePayment = async (req, res) => {
    // console.log("INSIDE CAPTURE PAYMENT")
  //get courseId and UserID
  const { courses } = req.body;
  const userId = req.user.id;
  //validation
  //valid courseID
  try {
    if (courses.length === 0) {
      return res.json({
        success: false,
        message: "Please provide valid course ID",
      });
    }

    let totalAmount = 0;
    for (const course_id of courses) {
      let course;
      try {
        course = await Course.findById(course_id);
        if (!course) {
          return res.json({
            success: false,
            message: "Could not find the course",
          });
        }
        //user already enrolled for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
          return res.status(200).json({
            success: false,
            message: "Student is already enrolled",
          });
        }
        totalAmount += course.price;
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };
    try {
      //initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      // console.log("payment", paymentResponse);
      //   return response
      return res.status(200).json({
        success: true,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//verify Signature of RazorPay and server
// BY THIS YOU CAN ONLY BUY ONE COURSE NOT MULTIPLE COURSE
// exports.verifySignature = async (req, res) => {
//   //haam ek webhooksecret create krenge jisse req ki body se compare krenge
//   // agr same hai to authorized user hoga
//   const webhookSecret = "12345678";
//   const signature = req.header("x-razorpay-signature");

//   //webhooksecret ko encrypt krnge
//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if (signature === digest) {
//     console.log("Payment is Authorised");

//     //fetch the courseId and userId
//     const { courseId, userId } = req.body.payload.payment.entity.notes;

//     try {
//       //fullfil the action

//       //find the course and enroll the student in it
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }
//       console.log(enrolledCourse);

//       //find the student and add the course to their list of enrolled courses
//       const enrolledStudent = await User.findOneAndUpdate(
//         { _id: userId },
//         { $push: { courses: courseId } },
//         { new: true }
//       );

//       console.log(enrolledCourse);

//       //confirmation ka mail send krna hai
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations from studyNotion",
//         "congratulations!You are onboarded into new courses"
//       );
//       console.log(emailResponse);
//       return res.status(200).json({
//         success: true,
//         message: "Signature verifed and course added",
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid Request",
//     });
//   }
// };

exports.verifyPayment = async (req, res) => {
    // console.log("INSIDE VERIFY PAYMENT........->")
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses
  
    const userId = req.user.id
  // console.log(" razorpay_order_id -->",razorpay_order_id)
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(200).json({ success: false, message: "Payment Failed HOGYA HAI " })
    }
    
    // console.log("PAYMENT VARIFIED .......!!!!!!.....")
  
    let body = razorpay_order_id + "|" + razorpay_payment_id
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex")

  
    if (expectedSignature === razorpay_signature) {
      
       await enrollStudents(courses, userId, res)
      return res.status(200).json({ success: true, message: "Payment Verified" })
    }
  
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }




// send email 
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      // console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }

const enrollStudents = async (courses, userId, res) => {
    // console.log("INSIDE ENROLLE STUDENT")
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }
  
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnrolled: userId } },
          { new: true }
        )
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        // console.log("Updated course ----------: ", enrolledCourse)
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )
  
        // console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
  
        // console.log("Email sent successfully: ", emailResponse.response)
      } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
  }