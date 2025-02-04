import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
// Redux
import { useDispatch, useSelector } from "react-redux";
// React Router
import { useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import NavBar from "./components/Common/NavBar";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Error from "./pages/Error";
import Settings from "./components/core/Dashboard/Settings";
// import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import CourseDetails from "./pages/CourseDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyProfile from "./components/core/Dashboard/MyProfile";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";
import Cart from "./components/core/Dashboard/Cart";
import Catalog from "./pages/Catalog";
import AddCourse from "./components/core/Dashboard/AddCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourses from "./components/core/Dashboard/EditCourse/Index";
import Contact from "./pages/Contact";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import { ACCOUNT_TYPE } from "./utils/constants";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";

function App() {
  // const dispatch = useDispatch()
  // const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile);

  return (
    <div
      className="w-screen min-h-screen  bg-richblack-900 
   flex flex-col font-inter"
    >
      <NavBar />  

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="catalog/:catalogName" element={<Catalog />} />
        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        {/* Private Route - for Only Logged in User */}
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses/>}
              /> 
          {/* Route only for the instructor  */}

          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              {/* <Route path="dashboard/instructor" element={<Instructor />} /> */}
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourses />}
              />
            </>
          )}


          {/* Routes only for students  */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
             <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              /> 
              <Route path="/dashboard/cart" element={<Cart />} />
            </>
          )} 

          <Route path="dashboard/settings" element={<Settings />} />
        </Route>

        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails/>}
              />
            </>
          )}
        </Route>

        <Route path="*" element={<Error />} />
      </Routes>

      {/* 404 Page */}
    </div>
  );
}

export default App;
