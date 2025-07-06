'use server'

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { revalidatePath } from "next/cache";
import { calculateNextRecurringDate, serializeTransaction } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import aj from "@/app/lib/arcjet";

export async function createTransaction(data) {
    try {
        const user = await getAuthenticatedUser();

        const req = await request();
        const decision = await aj.protect(req, {
            userId: user.id,
            requested: 1
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;
                console.error({
                    details: {
                        remaining,
                        reset,
                    },
                    code: "RATE_LIMIT_EXCEEDED"
                })
                throw new Error("Rate limit exceeded. Please try again later.");
            }

            console.error({
                details: {
                    reason: decision.reason,
                },
                code: "ACCESS_DENIED"
            })
            throw new Error("Access denied");
        }

        const account = await db.account.findUnique({ where: { id: data.accountId, userId: user.id } });

        if (!account) throw new Error("Account not found");

        const balanceChange = data.type === "EXPANSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval
                        ? calculateNextRecurringDate(data.recurringInterval, data.date)
                        : null,
                }
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance }
            });

            return newTransaction;
        })

        revalidatePath('/dashboard');
        revalidatePath(`/account/${transaction.accountId}`);

        return { success: true, data: serializeTransaction(transaction) };

    } catch (error) {
        throw new Error(error.message);
    }
}


export async function bulkDeleteTransaction(transactionsId) {
    try {
        const user = await getAuthenticatedUser();

        const transactions = await db.transaction.findMany({ where: { id: { in: transactionsId }, userId: user.id } });

        if (!transactions) throw new Error("Transactions not found");

        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const change = transaction.type === "EXPANSE" ? transaction.amount : -transaction.amount;

            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: { id: { in: transactionsId }, userId: user.id }
            });

            for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
                await tx.account.update({
                    where: { id: accountId }, data: { balance: { increment: balanceChange } }
                });
            }
        })

        revalidatePath('dashboard');
        revalidatePath('/account/[id]');

        return { success: true, data: null };

    } catch (err) {
        return { success: false, error: err.message };
    }
}