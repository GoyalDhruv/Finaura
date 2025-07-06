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

export const calculateNextRecurringDate = (startDate, interval) => {
    const data = new Date(startDate);

    switch (interval) {
        case 'DAILY':
            data.setDate(data.getDate() + 1);
            break;
        case 'WEEKLY':
            data.setDate(data.getDate() + 7);
            break;
        case 'MONTHLY':
            data.setMonth(data.getMonth() + 1);
            break;
        case 'YEARLY':
            data.setFullYear(data.getFullYear() + 1);
            break;
    }

    return data;
}