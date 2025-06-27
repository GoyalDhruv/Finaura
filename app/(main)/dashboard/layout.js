import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const DashboardLayout = () => {
    return (
        <div className='px-5'>
            <h1 className='text-7xl font-extrabold mb-5'>Dashboard</h1>

            <Suspense fallback={<BarLoader className='mt-2' width="100%" color="#36d7b7" />}>
                <DashboardPage />
            </Suspense>

        </div>
    )
}

export default DashboardLayout