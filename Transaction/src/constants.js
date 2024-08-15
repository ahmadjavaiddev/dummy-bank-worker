export const TRANSACTION_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

export const TransactionStatusEnum = Object.freeze({
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    QUEUED: "QUEUED",
});

export const TransactionTypeEnum = Object.freeze({
    TRANSFER: "TRANSFER",
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    REQUEST: "REQUEST",
});
