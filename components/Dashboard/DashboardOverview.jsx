'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560", "#775DD0", "#FEB019", "#3F51B5", "#4CAF50", "#F9CE1D", "#00E396", "#F86624", "#546E7A", "#26A69A", "#D10CE8", "#8D6E63", "#1E90FF", "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4"
];


const DashboardOverview = ({ accounts, transactions }) => {
    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts?.find(a => a?.isDefault)?.id || accounts?.[0]?.id
    );

    const [selectedRange, setSelectedRange] = useState('THIS_MONTH');

    const accountTransactions = transactions.filter(t => t.accountId === selectedAccountId);

    const recentTransactions = accountTransactions
        .sort((t1, t2) => new Date(t2.date) - new Date(t1.date))
        .slice(0, 5);

    const filterByDateRange = (transactions, range) => {
        const now = new Date();
        return transactions.filter(t => {
            const date = new Date(t.date);
            if (range === 'LAST_3_MONTHS') {
                const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                return date >= threeMonthsAgo;
            }
            if (range === 'LAST_6_MONTHS') {
                const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                return date >= sixMonthsAgo;
            }
            if (range === 'THIS_YEAR') {
                return date.getFullYear() === now.getFullYear();
            }
            // Default: THIS_MONTH
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
    };

    const filteredExpenses = filterByDateRange(
        accountTransactions.filter(t => t.type === 'EXPENSE'),
        selectedRange
    );

    const expensesByCategory = filteredExpenses.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    const pieChartData = Object.keys(expensesByCategory).map(category => ({
        name: category,
        value: expensesByCategory[category]
    }));

    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                    <CardTitle>
                        Recent Transactions
                    </CardTitle>
                    <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                    >
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts?.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {recentTransactions?.length > 0 ? (
                            recentTransactions.map(t => (
                                <div key={t.id} className='flex items-center justify-between'>
                                    <div className='space-y-1'>
                                        <p className='text-sm font-medium leading-none'>
                                            {t?.description || "Untitled Transaction"}
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            {format(new Date(t?.date), "PP")}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <div className={cn('flex items-center', t?.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500')}>
                                            {t?.type === 'EXPENSE' ? (
                                                <ArrowDownRight className='mr-1 h-4 w-4' />
                                            ) : (
                                                <ArrowUpRight className='mr-1 h-4 w-4' />
                                            )}
                                            ${t?.amount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='text-center text-muted-foreground py-4'>No recent transactions</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="justify-between">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Expense Breakdown</CardTitle>
                    <Select value={selectedRange} onValueChange={setSelectedRange}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="THIS_MONTH">This Month</SelectItem>
                            <SelectItem value="LAST_3_MONTHS">Last 3 Months</SelectItem>
                            <SelectItem value="LAST_6_MONTHS">Last 6 Months</SelectItem>
                            <SelectItem value="THIS_YEAR">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {pieChartData?.length > 0 ? (
                        <div className='h-[300px]'>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill='#8884d8'
                                        dataKey='value'
                                        label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                    >
                                        {
                                            pieChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))
                                        }
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className='text-center text-muted-foreground py-4'>No data for selected range</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardOverview;
