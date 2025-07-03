'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Table } from '@/components/ui/table';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';
import TransactionFilters from './TransactionTableWrapper/TransactionFilters';
import Pagination from './TransactionTableWrapper/Pagination';
import TransactionTableBody from './TransactionTableWrapper/TransactionTableBody';
import { useFetch } from '@/hooks/useFetch';
import { bulkDeleteTransaction } from '@/actions/transactions';

const ITEMS_PER_PAGE = 10;

const TransactionTableWrapper = ({ transactions }) => {

    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [recurringFilter, setRecurringFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        loading: bulkDeleteLoading,
        fetchData: bulkDeleteFn,
        data: bulkDeleteData
    } = useFetch(bulkDeleteTransaction);

    const handleBulkDelete = async () => {
        if (!window.confirm('Are you sure you want to delete these transactions?')) return;
        await bulkDeleteFn(selectedIds);
        setSelectedIds([]);
    };

    useEffect(() => {
        if (bulkDeleteData && !bulkDeleteLoading) {
            toast.success('Transactions deleted successfully');
        }
    }, [bulkDeleteData, bulkDeleteLoading]);

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];
        if (search) {
            result = result.filter(t =>
                t.description.toLowerCase().includes(search.toLowerCase()) ||
                t.category.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (typeFilter) {
            result = result.filter(t => t.type === typeFilter);
        }
        if (recurringFilter) {
            result = result.filter(t => recurringFilter === 'recurring' ? t.isRecurring : !t.isRecurring);
        }
        result.sort((a, b) => {
            let compare = 0;
            switch (sortConfig.field) {
                case 'date': compare = new Date(a.date) - new Date(b.date); break;
                case 'category': compare = a.category.localeCompare(b.category); break;
                case 'amount': compare = a.amount - b.amount; break;
                default: break;
            }
            return sortConfig.direction === 'asc' ? compare : -compare;
        });
        return result;
    }, [transactions, search, typeFilter, recurringFilter, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedTransactions, currentPage]);

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        setSelectedIds(current =>
            current.length === paginatedTransactions.length
                ? []
                : paginatedTransactions.map(t => t.id)
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setRecurringFilter('');
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSelectedIds([]);
    };

    return (
        <div className='space-y-4'>
            {bulkDeleteLoading && <BarLoader className='mt-4' width='100%' color='#36d7b7' />}

            <TransactionFilters
                search={search}
                setSearch={val => { setSearch(val); setCurrentPage(1); }}
                typeFilter={typeFilter}
                setTypeFilter={val => { setTypeFilter(val); setCurrentPage(1); }}
                recurringFilter={recurringFilter}
                setRecurringFilter={val => { setRecurringFilter(val); setCurrentPage(1); }}
                selectedIds={selectedIds}
                handleBulkDelete={handleBulkDelete}
                handleClearFilters={handleClearFilters}
            />

            <div className='rounded-md border'>
                <Table>
                    <TransactionTableBody
                        paginatedTransactions={paginatedTransactions}
                        selectedIds={selectedIds}
                        handleSelect={handleSelect}
                        handleSelectAll={handleSelectAll}
                        sortConfig={sortConfig}
                        handleSort={handleSort}
                        bulkDeleteFn={bulkDeleteFn}
                    />
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default TransactionTableWrapper;

