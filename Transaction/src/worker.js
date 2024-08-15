import User from "./models/user.model.js";
import Transaction from "./models/transaction.model.js";
import { notificationQueue } from "./managers/Queue.js";
import { redisClient } from "./redis.js";

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

function isValidAmount(sender, receiver, transactionQueued) {
    return (
        sender.balance < transactionQueued.amount ||
        transactionQueued.amount <= 0 ||
        sender._id === receiver._id ||
        sender.balance - transactionQueued.amount < 0
    );
}

async function findUserById(userId, errorMessage) {
    const user = await User.findOne({ _id: userId, isEmailVerified: true });
    if (!user) {
        throw new ApiError(401, errorMessage);
    }
    return user;
}

async function processTransaction(sender, receiver, transactionQueued) {
    if (isValidAmount(sender, receiver, transactionQueued)) {
        await notificationQueue(
            transactionQueued.from,
            "TRANSACTION_FAILED",
            "Insufficient Balance"
        );
        throw new ApiError(400, "Insufficient Balance");
    }

    sender.balance -= transactionQueued.amount;
    await sender.save({ validateBeforeSave: false });

    receiver.balance += transactionQueued.amount;
    await receiver.save({ validateBeforeSave: false });

    transactionQueued.status = "COMPLETED";
    await transactionQueued.save({ validateBeforeSave: false });
    const modifiedTransaction = transactionQueued.toObject();
    modifiedTransaction.from = {
        _id: sender._id,
        userName: sender.userName,
        email: sender.email,
    };
    modifiedTransaction.to = {
        _id: receiver._id,
        userName: receiver.userName,
        email: receiver.email,
    };

    await redisClient.del(`user:${sender._id}`, `user:${receiver._id}`);
    redisClient.publish("transaction", JSON.stringify(modifiedTransaction));
    await notificationQueue(transactionQueued.from, "TRANSACTION", "Payment Sent");
    await notificationQueue(transactionQueued.to, "TRANSACTION", "You Received");
}

const transactionWorker = async (job) => {
    const { userId, transactionId } = job;

    let transactionQueued;
    try {
        transactionQueued = await Transaction.findOne({
            _id: transactionId,
            status: "QUEUED",
        });
        if (!transactionQueued) {
            await notificationQueue(userId, "TRANSACTION_FAILED", "Transaction Not Found");
            throw new ApiError(404, "Transaction Not Found");
        }

        const sender = await findUserById(transactionQueued.from, "Sender Not Found");
        const receiver = await findUserById(transactionQueued.to, "Receiver Not Found");

        await processTransaction(sender, receiver, transactionQueued);
    } catch (error) {
        console.log("Error Custom :: ", error.message);
        if (transactionQueued) {
            transactionQueued.status = "FAILED";
            await transactionQueued.save({ validateBeforeSave: false });
        }
        if (error instanceof ApiError) {
            await notificationQueue(userId, "TRANSACTION_FAILED", error.message);
        }
    }
};

export { transactionWorker };
