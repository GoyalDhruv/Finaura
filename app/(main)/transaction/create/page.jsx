export const dynamic = 'force-dynamic';

import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import AddTransactionForm from '@/components/AddTransactions/AddTransactionForm'
import React from 'react'
import { getTransaction } from '@/actions/transactions';

const Transaction = async ({ searchParams }) => {
    const accounts = await getUserAccounts();

    const params = searchParams;
    const editId = params?.id;

    let initialData = null;
    if (editId) {
        initialData = await getTransaction(editId);
    }

    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className='text-7xl font-extrabold mb-5'>{editId ? "Edit " : "Add "} Transaction</h1>

            < AddTransactionForm
                accounts={accounts?.data}
                categories={defaultCategories}
                editMode={!!editId}
                initialData={initialData?.data}
            />
        </div>
    )
}

export default Transaction