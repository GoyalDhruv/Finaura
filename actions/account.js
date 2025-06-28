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