'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryColors } from '@/data/categories'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const RECURRING_INTERVALS = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly'
}

const TransactionTable = ({ transactions }) => {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState([])
    const [sortConfig, setSortConfig] = useState({
        field: 'date',
        direction: 'asc'
    })
    const filteredAndSortedTransactions = transactions;

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    return (
        <div className='space-y-4'>
            {/* Filters */}

            {/* Transactions */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('date')}
                            >
                                <div className='flex items-center'>
                                    Date
                                    {sortConfig?.field === 'date' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        )
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>
                                Description
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('category')}
                            >
                                <div className='flex items-center'>
                                    Category
                                    {sortConfig?.field === 'category' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        )
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort('amount')}
                            >
                                <div className='flex items-center justify-end'>
                                    Amount
                                    {sortConfig?.field === 'amount' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="ml-1 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        )
                                    )}
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedTransactions.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={7} className='text-center text-muted-foreground'>
                                    No transactions found
                                </TableCell>
                            </TableRow>
                            :
                            filteredAndSortedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="w-[50px]">
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className='capitalize'>
                                        <span
                                            style={{ backgroundColor: categoryColors[transaction.category] }}
                                            className='px-2 py-1 rounded text-white text-sm'
                                        >
                                            {transaction.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium"
                                        style={{ color: transaction.type === 'EXPENSE' ? 'red' : 'green' }}
                                    >
                                        {transaction.type === 'EXPENSE' ? '-' : '+'}
                                        ${transaction.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.isRecurring ?
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant='outline' className='gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'>
                                                        <RefreshCw className='h-3 w-3' />
                                                        {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>Next Date:</div>
                                                        <div>{format(new Date(transaction.nextRecurringDate), 'PP')}</div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                            :
                                            <Badge variant='outline' className='gap-1'>
                                                <Clock className='h-3 w-3' />
                                                One-time
                                            </Badge>
                                        }
                                    </TableCell>
                                    <TableCell className='text-end'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => { router.push(`/transaction/create?edit=${transaction.id}`) }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                // onClick={() => {deleteTransaction([transaction.id]) }}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TransactionTable