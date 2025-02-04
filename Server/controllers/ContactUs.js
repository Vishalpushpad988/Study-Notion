const {contactUsEmail} = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req,res)=>{
    const {email,firstname,lastname,message,phoneNo,countryCode} = req.body
    console.log(req.body);

    try {
        const emailRes = await mailSender(
            email,
            "Your Data send successfully",
            contactUsEmail(email,firstname,lastname,message,phoneNo,countryCode)
        )
        // console.log("YOU RESULT",emailRes);

        return res.json({
            success:true,
            message:"Email send successfully",
        })


    } catch (error) {
        
        console.log("Error ka naam",error)
        console.log("Error message",error.message);
        return res.json({
            success:false,
            message:'Something wents wrong..!!',
        })
    }
}