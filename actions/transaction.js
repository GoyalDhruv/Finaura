'use server'

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { calculateNextRecurringDate, serializeTransaction } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransaction(data) {
    try {
        const user = await getAuthenticatedUser();
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