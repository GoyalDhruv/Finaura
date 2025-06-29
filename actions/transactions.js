'use server'

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { revalidatePath } from "next/cache";

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