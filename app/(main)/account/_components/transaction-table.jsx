'use client'

import { bulkDeleteTransaction } from '@/actions/transactions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryColors } from '@/data/categories'
import { useFetch } from '@/hooks/useFetch'
import { format } from 'date-fns'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'

const RECURRING_INTERVALS = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly'
}

const ITEMS_PER_PAGE = 10;

const TransactionTable = ({ transactions }) => {

    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState([])
    const [sortConfig, setSortConfig] = useState({
        field: 'date',
        direction: 'asc'
    })
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [recurringFilter, setRecurringFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        loading: bulkDeleteLoading,
        fetchData: bulkDeleteFn,
        data: bulkDeleteData
    } = useFetch(bulkDeleteTransaction)

    const handleBulkDelete = async () => {
        if (!window.confirm('Are you sure you want to delete these transactions?')) return;

        await bulkDeleteFn(selectedIds)
        setSelectedIds([])
    }

    useEffect(() => {
        if (bulkDeleteData && !bulkDeleteLoading) {
            toast.success('Transactions deleted successfully')
        }
    }, [bulkDeleteData, bulkDeleteLoading])

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        if (search) {
            result = result.filter(transaction => transaction.description.toLowerCase().includes(search.toLowerCase()) || transaction.category.toLowerCase().includes(search.toLowerCase()));
        }

        if (typeFilter) {
            result = result.filter(transaction => transaction.type === typeFilter);
        }

        if (recurringFilter) {
            result = result.filter(transaction => recurringFilter === 'recurring' ? transaction.isRecurring : !transaction.isRecurring);
        }

        result.sort((a, b) => {
            let compare = 0;

            switch (sortConfig.field) {
                case 'date':
                    compare = new Date(a.date) - new Date(b.date);
                    break;
                case 'category':
                    compare = a.category.localeCompare(b.category);
                    break;
                case 'amount':
                    compare = a.amount - b.amount;
                    break;
                default:
                    compare = 0;
                    break;
            }

            return sortConfig.direction === 'asc' ? compare : -compare;
        })

        return result

    }, [
        transactions,
        sortConfig,
        search,
        typeFilter,
        recurringFilter
    ])

    const totalPages = Math.ceil(
        filteredAndSortedTransactions.length / ITEMS_PER_PAGE
    );
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedTransactions.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
        );
    }, [filteredAndSortedTransactions, currentPage]);

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(prevId => prevId !== id) : [...prev, id])
    }

    const handleSelectAll = () => {
        setSelectedIds((current) =>
            current.length === paginatedTransactions.length
                ? []
                : paginatedTransactions.map((t) => t.id)
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setRecurringFilter('');
        setSelectedIds([]);
        setCurrentPage(1);
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSelectedIds([]);
    };

    return (
        <div className='space-y-4'>

            {bulkDeleteLoading && <BarLoader className='mt-4' width='100%' color='#36d7b7' />}

            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        className='ps-8'
                        placeholder='Search Transactions ...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>

                <div className='flex gap-2'>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={recurringFilter}
                        onValueChange={(value) => {
                            setRecurringFilter(value)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className='w-[130px]'>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 && (
                        <div className='flex gap-2 items-center'>
                            <Button variant='destructive' size='sm' onClick={handleBulkDelete}>
                                <Trash className='h-4 w-4 mr-1' />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    )}

                    {(search || typeFilter || recurringFilter) && (
                        <Button
                            variant='outline'
                            size='icon'
                            title='Clear Filters'
                            onClick={handleClearFilters}
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </div>

            {/* Transactions */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    className='cursor-pointer'
                                />
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
                        {paginatedTransactions?.length === 0 ?
                            <TableRow>
                                <TableCell colSpan={7} className='text-center text-muted-foreground'>
                                    No transactions found
                                </TableCell>
                            </TableRow>
                            :
                            paginatedTransactions?.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="w-[50px]">
                                        <Checkbox
                                            onCheckedChange={() => handleSelect(transaction.id)}
                                            checked={selectedIds.includes(transaction.id)}
                                            className='cursor-pointer'
                                        />
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
                                                    onClick={() => { bulkDeleteFn([transaction.id]) }}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default TransactionTable