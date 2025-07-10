'use client'

import { updateDefaultAccount } from '@/actions/account'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useFetch } from '@/hooks/useFetch'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const AccountCard = ({ account }) => {

    const { name, type, balance, id, isDefault } = account;

    const {
        data: updatedAccount,
        error,
        fetchData: updateAccountFn,
        loading: updateAccountLoading
    } = useFetch(updateDefaultAccount)

    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success('Default Account updated successfully')
        }
    }, [updateAccountLoading, updatedAccount])

    useEffect(() => {
        if (error) {
            toast.error(error.message || 'Failed to update default account')
        }
    }, [error])

    const handleDefaultAccountChange = async (e) => {
        e.preventDefault();

        if (isDefault) {
            toast.warning('Account already set as default');
            return;
        }
        await updateAccountFn(id)
    }


    return (
        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <Link href={`/account/${id}`}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
                    <Switch
                        className='cursor-pointer'
                        checked={isDefault}
                        onClick={handleDefaultAccountChange}
                        disabled={updateAccountLoading}
                    />
                </CardHeader>
                <CardContent className='pt-2 pb-4'>
                    <div className='text-2xl font-bold'>
                        ${parseFloat(balance).toFixed(2)}
                    </div>
                    <p className='text-xs text-muted-foreground capitalize'>
                        {type} ACCOUNT
                    </p>
                </CardContent>
                <CardFooter className='flex justify-between text-sm text-muted-foreground'>
                    <div className='flex items-center'>
                        <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
                        Income
                    </div>
                    <div className='flex items-center'>
                        <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
                        Expense
                    </div>
                </CardFooter>
            </Link>
        </Card>
    )
}

export default AccountCard