const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode =  jwt.verify(token, process.env.JWT_SECRET);
			// console.log(decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

//isStudent 

exports.isStudent = async (req,res,next)=>{
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        // console.log("Ye rha h mera userDetails",userDetails)
        if(userDetails.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message :"This is a protected route for student only",
            });
        }
        next();


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified! Please Try again later"
        })
    }
}

//isInstructor 



exports.isInstructor = async (req,res,next)=>{
    try {
        const userDetails = await User.findOne({ email: req.user.email });
		// console.log("Ye rha user ki details",userDetails);
        
        if(userDetails.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message :"This is a protected route for is Instructor only",
            });
        }
        // console.log("Bhai IsInstructor tkk aaa gya mai ")
        next();
    } catch (error) {
        return res.status(401).json({
            success:true,
            message:"User role cannot be verified! Please Try again later"
        });
    }
}




// isAdmin 
exports.isAdmin = async (req,res,next)=>{
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        // console.log(userDetails);
        if(userDetails.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message :"This is a protected route for Admin only",
            });
        }
       
        next();


    } catch (error) {
        return res.status(401).json({
            success:true,
            message:"User role cannot be verified! Please Try again later"
        })
    }
}
