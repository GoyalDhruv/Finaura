import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'

const DashboardPage = () => {
    return (
        <div className='px-5'>
            {/* Budget Progress */}

            {/* Overview */}

            {/* Account Grid */}

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <CreateAccountDrawer>
                    <Card className='hover:shadow-md transition-shadow cursor-pointer border-dashed'>
                        <CardContent className='flex flex-col items-center justify-center text-muted-foreground h-full'>
                            <Plus className='w-10 mb-2' />
                            <p className='font-semibold'>Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>
            </div>

        </div>
    )
}

export default DashboardPage