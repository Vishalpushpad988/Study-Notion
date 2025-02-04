const Razorpay = require("razorpay");

//geeting the instance of razor pay 

exports.instance = new Razorpay({
    key_id:process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECRET,
})

