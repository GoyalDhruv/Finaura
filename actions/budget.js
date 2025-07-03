'use server'

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
    try {
        const user = await getAuthenticatedUser();

        const budget = await db.budget.findFirst({
            where: {
                userId: user.id
            }
        })

        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const expanses = await db.transaction.aggregate({
            where: {
                userId: user.id,
                accountId,
                type: "EXPENSE",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: {
                amount: true
            }
        })

        return {
            budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
            currentExpenses: expanses._sum.amount ? expanses._sum.amount.toNumber() : 0
        }

    } catch (e) {
        throw new Error(e.message);
    }
}

export async function updateBudget(amount) {
    try {
        const user = await getAuthenticatedUser();

        await db.budget.upsert({
            where: {
                userId: user.id
            },
            update: {
                amount
            },
            create: {
                userId: user.id,
                amount
            }
        })

        revalidatePath('/dashboard');

        return { success: true, data: { ...budget, amount: budget.amount.toNumber() } };

    } catch (error) {
        return { success: false, error: error.message };
    }
}