"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (transaction) => {
    const serialize = { ...transaction };

    if (transaction?.balance) {
        serialize.balance = transaction.balance.toNumber();
    }
}

export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!user) throw new Error("User not found");

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