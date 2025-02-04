import React from "react";
import { useEffect, useState } from "react";
import RatingStars from "./RatingStars";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";

import { FaStar } from "react-icons/fa";
import { Autoplay, Mousewheel, Keyboard } from "swiper/modules";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const truncateWords = 15;
  useEffect(() => {
    (async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      );
      if (data?.success) {
        setReviews(data?.data);
      }
    })();
  }, []);
  return (
    <div>
      <div>
        <Swiper
          mousewheel={{
            enabled: true,
            forceToAxis: true,
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          allowSlidePrev={true}
          slidesPerView={1}
          loop={true}
          spaceBetween={20}
          pagination={false}
          modules={[Mousewheel, Keyboard, Autoplay]}
          className="mySwiper md:pt-5"
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          style={{
            "--swiper-navigation-size": "20px",
          }}
          freeMode={false}
          rewind={false}
          centeredSlides={true}
          navigation={false}
          // navigation={
          //     {
          //         nextEl: ".swiper-button-next",
          //         prevEl: ".swiper-button-prev",
          //     }
          // }
          breakpoints={{
            300: { slidesPerView: 1.1, spaceBetween: 10 },
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.1 },
          }}
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                <div className="flex flex-col gap-3 min-h-[150px] bg-richblack-800 p-3 text-[14px] text-richblack-25">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>

                  <div className="font-medium text-richblack-25">
                    {review?.review.slice(0, 70)}...
                  </div>
                  <RatingStars Review_Count={review?.rating} />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewSlider;
