'use client';

import React from 'react';
import { TableRow, TableCell, TableHead, TableBody, TableHeader } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { categoryColors } from '@/data/categories';
import RecurringBadge from './RecurringBadge';
import { format } from 'date-fns';

const TransactionTableBody = ({
    paginatedTransactions,
    selectedIds,
    handleSelect,
    handleSelectAll,
    sortConfig,
    handleSort,
    bulkDeleteFn
}) => {
    const router = useRouter();

    return (
        <>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">
                        <Checkbox
                            checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                            onCheckedChange={handleSelectAll}
                            className='cursor-pointer'
                        />
                    </TableHead>

                    <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                        <span className='flex items-center'>
                            Date
                            {sortConfig?.field === 'date' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                            )}
                        </span>
                    </TableHead>

                    <TableHead>Description</TableHead>

                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                        <span className='flex items-center'>
                            Category
                            {sortConfig?.field === 'category' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                            )}
                        </span>
                    </TableHead>

                    <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                        <span className='flex items-center justify-end'>
                            Amount
                            {sortConfig?.field === 'amount' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                            )}
                        </span>
                    </TableHead>

                    <TableHead>Recurring</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {paginatedTransactions?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className='text-center text-muted-foreground'>
                            No transactions found
                        </TableCell>
                    </TableRow>
                ) : (
                    paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.includes(transaction.id)}
                                    onCheckedChange={() => handleSelect(transaction.id)}
                                    className='cursor-pointer'
                                />
                            </TableCell>

                            <TableCell suppressHydrationWarning>{format(new Date(transaction.date), 'PP')}</TableCell>
                            <TableCell>{transaction.description}</TableCell>

                            <TableCell className='capitalize'>
                                <span
                                    style={{ backgroundColor: categoryColors[transaction.category] }}
                                    className='px-2 py-1 rounded text-white text-sm'
                                >
                                    {transaction.category}
                                </span>
                            </TableCell>

                            <TableCell className="text-right font-medium" style={{ color: transaction.type === 'EXPENSE' ? 'red' : 'green' }}>
                                {transaction.type === 'EXPENSE' ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </TableCell>

                            <TableCell>
                                <RecurringBadge
                                    isRecurring={transaction.isRecurring}
                                    recurringInterval={transaction.recurringInterval}
                                    nextRecurringDate={transaction.nextRecurringDate}
                                />
                            </TableCell>

                            <TableCell className='text-end'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' className='h-8 w-8 p-0'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className='text-destructive' onClick={() => bulkDeleteFn([transaction.id])}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </>
    );
};

export default TransactionTableBody;