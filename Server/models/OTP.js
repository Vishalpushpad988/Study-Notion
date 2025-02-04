const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    otp:{
        type:String,
        require:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
});

//create a function to send emails

async function sendVerificationEmail(email,otp) {
    // Create a transporter to send emails

	// Define the email options

	// Send the email
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email From StudyNotion",
            emailTemplate(otp));
        // console.log("Email sent Successfully",mailResponse);
    
    } catch (error) {
        // console.log("Error occured while sending mails",error);
        throw error;
    }
    
}

//db me entry create hone se phele email me opt send krna hai 
//uske liye haame pre middleware ka use krna hoga after that 
// agr otp correct hai to database me update krna hai 

OTPSchema.pre("save",async function(next){
    if(this.isNew){
    await sendVerificationEmail(this.email,this.otp);
    }
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);