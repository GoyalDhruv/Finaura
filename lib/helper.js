import { genAI } from "./genAi";
import { db } from "./prisma";

export const serializeTransaction = (transaction) => {
    const serialize = { ...transaction };

    if (transaction?.balance) {
        serialize.balance = transaction.balance.toNumber();
    }

    if (transaction?.amount) {
        serialize.amount = transaction.amount.toNumber();
    }

    return serialize;
}

export const isNewMonth = (lastAlertDate, currentDate) => {
    return (
        lastAlertDate.getMonth() !== currentDate.getMonth() || lastAlertDate.getFullYear() !== currentDate.getFullYear()
    )
}

export const calculateNextRecurringDate = (interval, startDate) => {
    const date = new Date(startDate);

    switch (interval) {
        case 'DAILY':
            date.setDate(date.getDate() + 1);
            break;
        case 'WEEKLY':
            date.setDate(date.getDate() + 7);
            break;
        case 'MONTHLY':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'YEARLY':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date;
}

export function isTransactionDue(transaction) {
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    return nextDue <= today;
}

export async function getMonthyStats(userId, month) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    const stats = transactions.reduce(
        (stats, t) => {
            const amount = t.amount.toNumber();
            const category = t.category?.toLowerCase().trim() || "uncategorized";

            if (t.type === "EXPENSE") {
                stats.totalExpense += amount;
                stats.byCategory[category] = (stats.byCategory[category] || 0) + amount;
            } else {
                stats.totalIncome += amount;
            }

            return stats;
        },
        {
            totalIncome: 0,
            totalExpense: 0,
            byCategory: {},
            transactionCount: transactions.length,
        }
    );

    // Format numbers to 2 decimal places
    const formattedStats = {
        totalIncome: parseFloat(stats.totalIncome.toFixed(2)),
        totalExpense: parseFloat(stats.totalExpense.toFixed(2)),
        transactionCount: stats.transactionCount,
        byCategory: {},
    };

    for (const [category, amount] of Object.entries(stats.byCategory)) {
        formattedStats.byCategory[category] = parseFloat(amount.toFixed(2));
    }

    return formattedStats;
}


export async function generateFinancialInsights(stats, month) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
        Analyze this financial data and provide 3 concise, actionable insights.
        Focus on spending patterns and practical advice.
        Keep it friendly and conversational.

        Financial Data for ${month}:
        - Total Income: $${stats.totalIncome}
        - Total Expenses: $${stats.totalExpenses}
        - Net Income: $${stats.totalIncome - stats.totalExpenses}
        - Expense Categories: ${Object.entries(stats.byCategory)
                .map(([category, amount]) => `${category}: $${amount}`)
                .join(", ")}

        Format the response as a JSON array of strings, like this:
        ["insight 1", "insight 2", "insight 3"]
    `;

        const result = await model.generateContent(prompt)

        const text = result.response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error(error);

        return [
            "Your highest expense category this month might need attention.",
            "Consider setting up a budget for better financial management.",
            "Track your recurring expenses to identify potential savings.",
        ];
    }
}