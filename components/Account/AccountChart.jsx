'use client'

import { format } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const DATE_RANGE = {
    '7D': { label: 'Last 7 Days', days: 7 },
    '1M': { label: 'Last 1 Month', days: 30 },
    '3M': { label: 'Last 3 Months', days: 90 },
    '6M': { label: 'Last 6 Months', days: 180 },
    'ALL': { label: 'All Time', days: null },
}

const AccountChart = ({ transactions }) => {

    const [dateRange, setDateRange] = useState('1M');

    const reducedTransactionData = (transactions) => {
        return transactions.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), 'MMM dd');

            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }

            if (transaction.type === 'INCOME') {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount;
            }

            return acc;
        }, {});
    }

    const filteredData = useMemo(() => {
        let data = [];
        if (dateRange === 'ALL') {
            data = reducedTransactionData(transactions)
        }
        else {
            const days = DATE_RANGE[dateRange].days;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            data = reducedTransactionData(transactions.filter(transaction => new Date(transaction.date) >= startDate));
        }

        return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));

    }, [dateRange, transactions]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => {
            acc.income += item.income;
            acc.expense += item.expense;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredData]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle>Transaction Overview</CardTitle>
                <Select defaultValue={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DATE_RANGE).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {value.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className='flex justify-around mb-6 text-sm'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Income</p>
                        <p className='font-bold text-lg text-green-500'>${totals.income.toFixed(2)}</p>
                    </div>

                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Expense</p>
                        <p className='font-bold text-lg text-red-500'>${totals.expense.toFixed(2)}</p>
                    </div>

                    <div className='text-center'>
                        <p className='text-muted-foreground'>Net</p>
                        <p className={`font-bold text-lg ${totals.income - totals.expense > 0 ? 'text-green-500' : 'text-red-500'}`}>${(totals.income - totals.expense).toFixed(2)}</p>
                    </div>
                </div>

                <div className='h-[300px]'>


                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`}/>
                            <Legend />

                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                </div>
            </CardContent>
        </Card>

    )
}

export default AccountChart

