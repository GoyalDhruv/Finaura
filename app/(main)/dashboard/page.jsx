import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React, { Suspense } from 'react'
import AccountCard from './_components/AccountCard'
import { getCurrentBudget } from '@/actions/budget'
import BudgetProgress from '@/components/Dashboard/BudgetProgress'
import { BarLoader } from 'react-spinners'
import DashboardOverview from '@/components/Dashboard/DashboardOverview'

const DashboardPage = async () => {

    const accounts = await getUserAccounts();

    const defaultAccount = accounts?.data?.find(account => account.isDefault);

    let budgetData = null;

    if (defaultAccount) {
        budgetData = await getCurrentBudget(defaultAccount.id);
    }

    const transactions = await getDashboardData();

    return (
        <div className='px-5 space-y-5'>
            {/* Budget Progress */}
            {defaultAccount &&
                <BudgetProgress
                    initialBudget={budgetData?.budget}
                    currentExpenses={budgetData?.currentExpenses || 0}
                />
            }

            {/* Overview */}
            <Suspense fallback={<BarLoader className='mt-2' width="100%" color="#36d7b7" />}>
                <DashboardOverview transactions={transactions} accounts={accounts?.data} />
            </Suspense>


            {/* Account Grid */}

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <CreateAccountDrawer>
                    <Card className='hover:shadow-md transition-shadow cursor-pointer border-dashed h-full'>
                        <CardContent className='flex flex-col items-center justify-center text-muted-foreground h-full'>
                            <Plus className='w-10 mb-2' />
                            <p className='font-semibold'>Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>

                {accounts?.data?.length > 0 && accounts?.data?.map((account) => {
                    return (
                        <AccountCard key={account.id} account={account} />
                    )
                })}
            </div>

        </div>
    )
}

export default DashboardPage