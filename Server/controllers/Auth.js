const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require('otp-generator');
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

//Send OTP while signup 
//step: fetch email -> check user already exist of not->if no ->
//-> generate otp(should be unique) -> save it to DB (because haame last me
// compare krna h ki to db me otp h aur jo user ne enter kiya hai wo same ha ya nhi)

exports.sendOTP = async(req,res)=>{
    try {
        const { email } = req.body
    
        // Check if user is already present
        // Find user with provided email
        const checkUserPresent = await User.findOne({ email })
        // to be used in case of signup
    
        // If user found with provided email
        if (checkUserPresent) {
          // Return 401 Unauthorized status code with error message     
          return res.status(401).json({
            success: false,
            message: `User is Already Registered`,
          })
        }
    
        var otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        })
        const result = await OTP.findOne({ otp: otp })
        // console.log("Result is Generate OTP Func")
        // console.log("OTP", otp)
        // console.log("Result", result)
        while (result) {
          otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
          })
        }
        const otpPayload = { email, otp }
        const otpBody = await OTP.create(otpPayload)
        // console.log("OTP Body", otpBody)
        res.status(200).json({
          success: true,
          message: `OTP Sent Successfully`,
          otp,
        })
      } catch (error) {
        console.log(error.message)
        return res.status(500).json({ success: false, error: error.message })
      }
    }

//SignUp
exports.signUp = async (req,res)=>{

    try {
        
            //data fetch from req. ki body 
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
    } = req.body;
    //validate krlo
    if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
        return res.status(403).json({
            success:false,
            message:"Please fill all the details",
        })
    }
    
    //check both the pswd 
    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and confirm Password must be same",
        });
    
    }
    //check user already exist to nhi krta
    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"user already registered",
        });
    }
    //find most recent OTP stored for the user
    const recentOtp =  await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    // console.log("Recent OTP :",recentOtp);  

    
    // console.log("OTP IS THIS",recentOtp[0].otp);
    //Validate OTP
    if(recentOtp.length === 0){
        //otp not found
        return res.status(400).json({
            success:"false",
            message:"OTP NOT FOUND",
        });
    }
    else if(otp !== recentOtp[0].otp){
        //invalid OTP
        return res.status(401).json({
            success:false,
            message:"invalid OTP",
        });  
    }


    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    
    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

    //Create Entry in DB
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType:accountType,
        approved:approved,
        additionalDetails:profileDetails._id,
        Image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // console.log("Ye mera user",user);

    //return response 
    return res.status(200).json({
        success:true,
        message:"User registered Successfully",
        user,
    });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register. !please try agaim"
        })
    }
     
}

//login
exports.login = async (req,res)=>{
    try {
        //get the data from req ki body
        const {email,password} = req.body;

        //validate data sent in req 
        if(!email || !password){
            return res.status(402).json({
                success : false,
                message:"All details must be filled",
            });
        }

        //check user exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){
            return res.status(403).json({
                success:false,
                message:"User is not registered! Please signup first",
            });
        }

        //if yes ! the generate JWT , After password matching
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType:user.accountType,
            };

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

        //create cookie and send response 
        const options = {
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly : true,
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"Logged in successfully",
        });
    }
    else{
        return res.status(401).json({
            success:false,
            message:"Incorrect Password",
        });
    }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Fail to Login! Please try again later"
        })
    }
}


//change Password
exports.changePassword = async (req,res)=>{
    //get data from req ki body 
    //get oldPassword , newPassword , confirmNewPassword
    const {oldPassword,newPassword,confirmPassword} = req.body;
    //validation
    if(newPassword !== confirmPassword){
        return res.status(401).json({
            success:false,
            message:"Password and confimr password donot match",
        });
    }
    //finding the user
    const user = await User.findOne({email:req.user.email});
    //if user doesnot exist 
    if(!user){
        return res.status(401).json({
            success:false,
            message:"User Doesnot exist",
        });
    }
    // match the password with the old password 
    const isMath = await bcrypt.compare(oldPassword,user.password);
    if(!isMath){
        return res.status(401).json({
            success:false,
            message:"Old Password is incorrect",
        });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(newPassword,10);

    //update pswd in DB 
    await User.findByIdAndUpdate(req.user.id,{password:hashedPassword});
    //send mail - Password Updated
    await mailSender(user.email,"Password Changed","Password has been change now you can login with your changed pswd")

    //return respone

    return res.status(200).json({
        success:true,
        message:"Password changed successfully",
    });
}