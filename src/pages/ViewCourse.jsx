import React, { useEffect,useState,useRef } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal'
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar'
import { getFullDetailsOfCourse } from '../services/operations/courseDetails'
import { setCompletedLectures } from '../slices/viewCourseSlice'
import { setCourseSectionData } from '../slices/viewCourseSlice'
import { setTotalNoOfLectures } from '../slices/viewCourseSlice'
import { setEntireCourseData } from '../slices/viewCourseSlice'
const ViewCourse = () => {

  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  useEffect(()=>{
    ;(async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      // console.log("Course Data here... ----->", courseData.courseDetails)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      // console.log("Course Section data ----->",courseData.courseDetails.courseContent)
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      // console.log("Completed Video Lacture ----->",courseData.completedVideos)
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.SubSection.length
      })
      // console.log("TOTAL LACTURES ---->",lectures);
      dispatch(setTotalNoOfLectures(lectures))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  return (
    <>
    <div className="relative flex min-h-[calc(100vh-3.5rem)]">
      <VideoDetailsSidebar setReviewModal = {setReviewModal}/>
      <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
    </div>
    {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}

export default ViewCourse