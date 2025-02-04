console.log("HELLO JII ONCE AGAIN Mere trf se")

const express = require("express");
const app = express();

const userRoutes = require("./routers/User");
const profileRoutes = require("./routers/Profile");
const paymentRoutes = require("./routers/Payments");
const courseRoutes = require("./routers/Course");
const contactUsRoute = require("./routers/Contact");


const database  = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");//isse front end backend se interact krta hai
const {cloudinaryConnect} = require("./config/cloudinary");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

dotenv.config();

const PORT = process.env.PORT || 3000;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"*",
        credential:true,
    })
);
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp/",
    })
);

//connect to cloudinary
cloudinaryConnect();

//mount routes 
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/reach",contactUsRoute);

//def route
  
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"your server is up and running...."
    });
});

// activate server 
app.listen(PORT,()=>{
    console.log(`App running at ${PORT}`);
});
  