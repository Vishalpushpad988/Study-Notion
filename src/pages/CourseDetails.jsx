import React, { useEffect, useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
// import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { fetchCourseDetails } from "../services/operations/courseDetails";
import { BuyCourse } from "../services/operations/studentFeaturesAPI";
import GetAvgRating from "../utils/avgRating";
import Error from "./Error";
import RatingStars from "../components/Common/RatingStars";
import { formatDate } from "../services/formatDate";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import Footer from "../components/Common/Footer";
import ConfirmationModal from "../components/Common/ConfirmationModal";

const CourseDetails = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Getting courseId from url parameter
  const { courseId } = useParams();
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    (async () => {
      try {
        const res = await fetchCourseDetails(courseId);
        console.log("course details res: ", res.data.courseDetails)
        setResponse(res);
      } catch (error) {
        console.log("Could not fetch Course Details");
      }
    })();
  }, [courseId]);

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0);
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails?.ratingAndReviews);
    setAvgReviewCount(count);
  }, [response]);
  // console.log("avgReviewCount: ", avgReviewCount)

  // // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0));
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e !== id)
    );
  };
  // console.log("Time Duration-->")
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0);
  useEffect(() => {
    let lectures = 0;
    // console.log("HEELLLOO ASSSSHHIISSHH ---> ",response)
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.SubSection.length || 0;
    });
    // console.log("TOTAL LACTURES",lectures);
    setTotalNoOfLectures(lectures);
  }, [response]);

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="loader"></div>
      </div>
    );
  }
  if (!response.success) {
    return <Error />;
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = response.data?.courseDetails;

  const handleBuyCourse = () => {
    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch);
      return;
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  if (paymentLoading) {
    // console.log("payment loading")
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
    <div className={` relative w-full bg-richblack-900`}>
      {/* Hero Section  */}
      <div className="bg-richblack-800">
      <div className="mx-auto box-content px-4 lg:w-[1260px] lg:relative ">
        <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
          <div className="relative block max-h-[30rem] lg:hidden">
            <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
            <img
              src={thumbnail}
              alt="course thumbnail"
              className="aspect-auto w-full"
            />
          </div>
          <div
            className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}
          >
            <div>
              <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
                {courseName}
              </p>
            </div>
            <p className={`text-richblack-200`}>{courseDescription}</p>
            <div className="text-md flex flex-wrap items-center gap-2">
              <span className="text-yellow-25">{avgReviewCount}</span>
              <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
              <span>{`(${ratingAndReviews.length} reviews)`}</span>
              <span>{`${studentsEnrolled.length} students enrolled`}</span>
            </div>
            <div>
              <p className="">
                Created By {`${instructor.firstName} ${instructor.lastName}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-lg">
              <p className="flex items-center gap-2">
                {" "}
                <BiInfoCircle /> Created at {formatDate(createdAt)}
              </p>
              <p className="flex items-center gap-2">
                {" "}
                <HiOutlineGlobeAlt /> English
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
            <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
              Rs. {price}
            </p>
            <button className="yellowButton" onClick={handleBuyCourse}>
              Buy Now
            </button>
            <button className="blackButton">Add to Cart</button>
          </div>
        </div>
        {/* Courses Card */}
        <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block">
          <CourseDetailsCard
            course={response?.data?.courseDetails}
            setConfirmationModal={setConfirmationModal}
            handleBuyCourse={handleBuyCourse}
          />
        </div>
      </div>
      </div>


      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
                      {/* What will you learn section */}
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold">What you'll learn</p>
            <div className="mt-5">
          {whatYouWillLearn}
            </div>
          </div>
 {/* Course Content Section */}
 <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  {/* YE KRNA HAI END MEI  */}
                  {/* <span>{response?.data?.courseDetails?.courseContent?.[0]?.SubSection?.[0].timeDuration}s total length</span> */}
                </div>
                <div>
                  <button
                    className="text-yellow-25"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>
              <p className="text-richblack-50 text-sm mb-10">
                {instructor?.additionalDetails?.about}
              </p>
            </div>

            <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[990px]">
          <div className="my-8 border border-richblack-600 p-3 md:p-8">
            <p className="text-3xl font-semibold">Reviews</p>
            <div className="mt-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-semibold">
                    {avgReviewCount}
                  </span>
                  <span className="text-2xl">/5</span>
                  <span className="text-richblack-50">
                    ({response?.data?.courseDetails?.ratingAndReviews?.length} ratings)
                  </span>
                  <span className="text-richblack-50">|</span>
                  <span className="text-richblack-50">
                    {" "}
                    {response?.data?.courseDetails?.studentsEnrolled?.length} students
                  </span>
                </div>
              </div>
            </div>
            {response?.data?.courseDetails?.ratingAndReviews?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:items-baseline gap-3 my-4 mt-12 ga"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={item?.user?.image}
                    alt="user img"
                    className="w-[30px] h-[30px] rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <p className="md:text-xl min-w-max font-semibold">
                      {item?.user?.firstName} {item?.user?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <RatingStars Review_Count={item?.rating} />
                  </div>
                  <p className="text-richblack-50 text-[12px] md:text-sm max-w-4xl">
                    {item?.review}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
          </div>

        </div>
      </div>
      <Footer/>
      
    </div>
    {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CourseDetails;
