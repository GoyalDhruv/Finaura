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