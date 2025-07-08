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