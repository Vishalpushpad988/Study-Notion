import React from 'react'
import { useSelector } from 'react-redux'
import {Outlet} from "react-router-dom"
import Sidebar from '../components/core/Dashboard/Sidebar'
import Footer from '../components/Common/Footer'

const Dashboard = () => {

    const {loading: authLoading} = useSelector( (state) => state.auth );
    const {loading: profileLoading} = useSelector( (state) => state.profile );



    if(profileLoading || authLoading) {
        return (

            <div className='mt-10'>
                Loading...
            </div>
        )
    }


  return (
    <div>
            <div className='relative flex bg-richblack-800'>
        <Sidebar />
        <div className=' flex-1 overflow-auto bg-richblack-900'>
            <div className='py-10'>
                <Outlet />
            </div>
        </div>

       
    </div>
    <Footer/>
    </div>

     
  )
}

export default Dashboard