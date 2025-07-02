'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash, X } from 'lucide-react';

const TransactionFilters = ({
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    recurringFilter,
    setRecurringFilter,
    selectedIds,
    handleBulkDelete,
    handleClearFilters
}) => (
    <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
                className='ps-8'
                placeholder='Search Transactions ...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <div className='flex gap-2'>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
            </Select>
            <Select value={recurringFilter} onValueChange={setRecurringFilter}>
                <SelectTrigger className='w-[130px]'><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="recurring">Recurring Only</SelectItem>
                    <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                </SelectContent>
            </Select>
            {selectedIds.length > 0 && (
                <Button variant='destructive' size='sm' onClick={handleBulkDelete}>
                    <Trash className='h-4 w-4 mr-1' /> Delete Selected ({selectedIds.length})
                </Button>
            )}
            {(search || typeFilter || recurringFilter) && (
                <Button variant='outline' size='icon' title='Clear Filters' onClick={handleClearFilters}>
                    <X className='h-4 w-4' />
                </Button>
            )}
        </div>
    </div>
);


export default TransactionFilters;