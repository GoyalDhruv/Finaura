'use server'

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { serializeTransaction } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDefaultAccount(accountId) {
    try {

        const user = await getAuthenticatedUser();

        await db.account.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false }
        })

        await db.account.update({
            where: { id: accountId, userId: user.id },
            data: { isDefault: true }
        })

        revalidatePath('/dashboard');

        return { success: true, data: serializeTransaction(account) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAccountWithTranscation(accountId) {
    try {
        const user = await getAuthenticatedUser();

        const account = await db.account.findUnique({
            where: { id: accountId, userId: user.id },
            include: {
                transactions: { orderBy: { createdAt: 'desc' } },
                _count: { select: { transactions: true } }
            }
        })

        if (!account) throw new Error("Account not found");

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction)
        }

    } catch (error) {
        return { success: false, error: error.message };
    }
}