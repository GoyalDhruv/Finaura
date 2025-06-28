"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { serializeTransaction } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAccount(data) {
    try {

        const user = await getAuthenticatedUser();

        const floatBalance = parseFloat(data.balance);
        if (isNaN(floatBalance)) throw new Error("Invalid balance");

        const existingAccount = await db.account.findMany({
            where: {
                userId: user.id
            }
        })

        const shouldBeDefault = existingAccount?.length === 0 ? true : data.isDefault;

        if (shouldBeDefault) {
            await db.account.updateMany({
                where: {
                    userId: user.id,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            })
        }

        const newAccount = await db.account.create({
            data: {
                ...data,
                balance: floatBalance,
                isDefault: shouldBeDefault,
                userId: user.id
            }
        })

        const serializedAccount = serializeTransaction(newAccount);

        revalidatePath('/dashboard');

        return { success: true, data: serializedAccount };

    } catch (e) {
        throw new Error(e.message);

    }
}

export async function getUserAccounts() {
    try {
        const user = await getAuthenticatedUser();

        const accounts = await db.account.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })

        const serializedAccounts = accounts.map(serializeTransaction);

        return { success: true, data: serializedAccounts };
    } catch (e) {
        throw new Error(e.message);
    }
}  