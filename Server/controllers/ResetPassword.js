const { response } = require("express");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require('crypto');


//resetPasswordToken - iski help se ham ek token generate krenge jissse user ki DB me insert krenge
//and baad me isi token ka use krke user ki password ko reset krr skte hai 
exports.resetPasswordToken = async(req,res)=>{
    try {
        //get email from req ki body
        const email = req.body.email;
        
        //check user for this email , email validation
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"This email not exist"
            });
        }
        //generate token
        const token = crypto.randomBytes(20).toString("hex")

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},
            {
                token:token,
                resetPasswordExpires:Date.now()+3600000,
            },
            {new:true},
        );
        // console.log("DETAILS",updatedDetails);
        //create url
        // const url = `http://localhost:3000/update-password/${token}`;
         const url = `https://study-notion-ashish-db88.vercel.app/update-password/${token}`

        //send mail containing the url 

        await mailSender(email,
            "Password Reset Link",
            `Click on the link to reset the password  -: ${url}`);

            //return response
            return res.status(200).json({
                success:true,
                message:"Email sent Successfully.Check the mail to change the password",
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
            success:false,
            message:"Something went wrong while sending reset link"
        })
    }
}

//resetPassword 

exports.resetPassword = async (req,res)=>{
    try {
        
        //fetch data
        const {password,confirmPassword,token} = req.body;
        //validation
        if(password != confirmPassword){
            return res.json({
                success:false,
                message:"Password not match",
            });
        }
        //get userdetails from db using token 
        const userDetails = await User.findOne({token : token});

        //if no entry - invalid token 
        if(!userDetails){
            return res.json({
                success:false,
                message:'Invalid token '
            });
        }
        //check token time
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token Expired! Please generate it again",
            });
        }
        //Hash password
        const hashedPassword = await bcrypt.hash(password,10);

        //Update the password in DB with thr help of token
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},//DB me change ko show krne ke liye 
        );

        return res.status(200).json({
            success:true,
            message:"Password Reset Successfully"
        })


    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"something wents wrong while resetting the password"
        });
    }
}