'use client'

import { transactionSchema } from '@/app/lib/schema'
import { useFetch } from '@/hooks/useFetch'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import CreateAccountDrawer from '../CreateAccountDrawer'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import { Switch } from '../ui/switch'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTransaction } from '@/actions/transactions'

const AddTransactionForm = ({ accounts, categories }) => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, setValue, getValues, watch, reset } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "INCOME",
            amount: "",
            description: "",
            date: new Date(),
            accountId: accounts?.find(a => a?.isDefault)?.id,
            isRecurring: false
        }
    })

    const {
        loading: transactionLoading,
        fetchData: transactionFn,
        data: transactionData
    } = useFetch(createTransaction)

    const type = watch('type');
    const isRecurring = watch('isRecurring');
    const date = watch('date');

    const filteredCategories = categories?.filter(c => c.type === type);

    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount)
        };

        await transactionFn(formData);
    }

    useEffect(() => {
        if (transactionData?.success && !transactionLoading) {
            toast.success('Transaction created successfully');
            reset();
            router.push(`/account/${transactionData?.data?.accountId}`);
        }
    }, [transactionLoading, transactionData])

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Type</label>
                <Select
                    onValueChange={(value) => setValue('type', value)}
                    defaultValue={type}
                >
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INCOME">INCOME</SelectItem>
                        <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount</label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...register('amount')}
                    />
                    {errors.amount && <p className='text-sm text-red-500'>{errors.amount.message}</p>}
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Account</label>
                    <Select
                        onValueChange={(value) => setValue('accountId', value)}
                        defaultValue={getValues('accountId')}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button variant='ghost' className='w-full select-none cursor-pointer items-center text-sm outline-none'>
                                    Create New Account
                                </Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {errors.accountId && <p className='text-sm text-red-500'>{errors.accountId.message}</p>}
                </div>
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Category</label>
                <Select
                    onValueChange={(value) => setValue('category', value)}
                    defaultValue={getValues('category')}
                >
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className='text-sm text-red-500'>{errors.category.message}</p>}
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant='outline' className='w-full ps-3 text-left font-normal cursor-pointer'>
                            {date ? format(date, 'PP') : <span>Select Date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => setValue('date', date)}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && <p className='text-sm text-red-500'>{errors.date.message}</p>}
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Description</label>
                <Input
                    type="text"
                    placeholder="Enter Description"
                    {...register('description')}
                />
                {errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>}
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className='space-y-1'>
                    <label htmlFor='isDefault' className='text-sm font-medium cursor-pointer'>
                        Recurring Transaction
                    </label>
                    <p className='text-xs text-muted-foreground'>
                        Set up a recurring schedule for this transaction
                    </p>
                </div>
                <Switch
                    onCheckedChange={(value) => setValue('isRecurring', value)}
                    checked={isRecurring}
                />
            </div>

            {isRecurring &&
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Recurring Interval</label>
                    <Select
                        onValueChange={(value) => setValue('recurringInterval', value)}
                        defaultValue={getValues('recurringInterval')}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select Interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.recurringInterval && <p className='text-sm text-red-500'>{errors.category.message}</p>}
                </div>
            }

            <div className='flex gap-4'>
                <Button
                    type='submit'
                    className='w-full cursor-pointer'
                    disabled={transactionLoading}
                >
                    {transactionLoading ?
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Creating Transaction
                        </>
                        :
                        "Create Transaction"
                    }
                </Button>

                <Button
                    type='button'
                    variant='outline'
                    className='w-full cursor-pointer'
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
            </div>

        </form>
    )
}

export default AddTransactionForm