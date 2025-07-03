'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { updateBudget } from '@/actions/budget';
import { Progress } from '../ui/progress';

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");

    const budgetUsed = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0;

    const handleCancel = () => {
        setIsEditing(false);
        setNewBudget(initialBudget?.amount?.toString() || "");
    }

    const {
        loading: updateBudgetLoading,
        data: updateBudgetData,
        error: updateBudgetError,
        fetchData: updateBudgetFn
    } = useFetch(updateBudget)

    const handleUpdateBudget = async () => {
        const amount = parseFloat(newBudget);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid number");
            return;
        }

        await updateBudgetFn(amount);
    }

    useEffect(() => {
        if (updateBudgetData?.success) {
            setIsEditing(false);
            toast.success('Budget updated successfully');
        }
    }, [updateBudgetData])

    useEffect(() => {
        if (updateBudgetError) {
            toast.error(updateBudgetError.message);
        }
    }, [updateBudgetError])

    return (
        <Card>
            <CardHeader className='flex items-center space-y-0'>
                <div className='flex-1'>
                    <CardTitle>Monthly Budget (Default Account)</CardTitle>
                    <div className='flex items-center gap2- mt-1'>
                        {isEditing ?
                            <div className='flex items-center gap-2'>
                                <Input
                                    type="number"
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(e.target.value)}
                                    className='w-32'
                                    placeholder="Enter amount"
                                    autoFocus
                                    disabled={updateBudgetLoading}
                                />
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleUpdateBudget}
                                    className='cursor-pointer'
                                    disabled={updateBudgetLoading}
                                >
                                    <Check className='w-4 h-4 text-green-500' />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleCancel}
                                    className='cursor-pointer'
                                    disabled={updateBudgetLoading}
                                >
                                    <X className='w-4 h-4 text-red-500 cursor-pointer' />
                                </Button>
                            </div>
                            :
                            <>
                                <CardDescription>
                                    {initialBudget ?
                                        `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent` : "No budget set"}
                                </CardDescription>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setIsEditing(true)}
                                    className='h-6 w-6 cursor-pointer'
                                >
                                    <Pencil className='w-3 h-3' />
                                </Button>
                            </>
                        }
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {initialBudget &&
                    <div className='space-y-2'>
                        <Progress
                            value={budgetUsed}
                            extraStyles={`${budgetUsed >= 90 ? 'bg-red-500' : budgetUsed >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        />
                        <p className='text-xs text-muted-foreground text-right'>
                            {budgetUsed.toFixed(2)}% used
                        </p>
                    </div>
                }
            </CardContent>
        </Card>
    )
}

export default BudgetProgress