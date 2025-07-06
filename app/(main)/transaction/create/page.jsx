import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import AddTransactionForm from '@/components/AddTransactions/AddTransactionForm'
import React from 'react'

const Transaction = async () => {
    const accounts = await getUserAccounts();

    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className='text-7xl font-extrabold mb-5'>Add Transaction</h1>

            <AddTransactionForm accounts={accounts?.data} categories={defaultCategories} />
        </div>
    )
}

export default Transaction