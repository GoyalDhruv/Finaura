import { getAccountWithTransaction } from '@/actions/account'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners';
import TransactionTable from '../_components/transaction-table';

const AccountPage = async ({ params }) => {
    const { id } = await params;
    const accountData = await getAccountWithTransaction(id)

    if (!accountData) notFound()

    return (
        <div className='space-y-8 px-5'>
            <div className='flex gap-4 items-end justify-between'>
                <div>
                    <h1 className='text-5xl sm:text-6xl font-bold tracking-tight capitalize'>
                        {accountData?.name}
                    </h1>
                    <p className='text-muted-foreground'>
                        {accountData?.type} Account
                    </p>
                </div>

                <div className='text-right pb-2'>
                    <div className='text-xl sm:text-2xl font-bold'>
                        ${parseFloat(accountData?.balance).toFixed(2)}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                        {accountData?._count?.transactions} Transactions
                    </p>
                </div>
            </div>

            {/* Chart Section */}

            {/* Transaction Table */}
            <Suspense fallback={<BarLoader className='mt-2' width="100%" color="#36d7b7" />}>
                <TransactionTable transactions={accountData?.transactions} />
            </Suspense>
        </div>
    )
}

export default AccountPage