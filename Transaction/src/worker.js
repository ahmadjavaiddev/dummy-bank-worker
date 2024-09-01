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

function isInvalidAmount(sender, receiver, amount) {
    return amount <= 0 || sender._id.equals(receiver._id) || sender.balance < amount;
}

async function findUserById(userId, errorMessage) {
    const user = await User.findOne({ _id: userId, isEmailVerified: true });
    if (!user) throw new ApiError(401, errorMessage);
    return user;
}

async function processTransaction(sender, receiver, transaction) {
    if (isInvalidAmount(sender, receiver, transaction.amount)) {
        await notificationQueue(sender._id, "TRANSACTION_FAILED", "Insufficient Balance");
        throw new ApiError(400, "Insufficient Balance");
    }

    sender.balance -= transaction.amount;
    receiver.balance += transaction.amount;

    await sender.save({ validateBeforeSave: false });
    await receiver.save({ validateBeforeSave: false });

    transaction.status = "COMPLETED";
    await transaction.save({ validateBeforeSave: false });

    await redisClient.del(
        `transactions:user:${sender._id}`,
        `transactions:user:${receiver._id}`,
        `user:${sender._id}`,
        `user:${receiver._id}`
    );

    const transactionDetails = {
        ...transaction.toObject(),
        from: { _id: sender._id, userName: sender.userName, email: sender.email },
        to: { _id: receiver._id, userName: receiver.userName, email: receiver.email },
    };

    redisClient.publish("transaction", JSON.stringify(transactionDetails));
    await notificationQueue(sender._id, "TRANSACTION", "Payment Sent");
    await notificationQueue(receiver._id, "TRANSACTION", "You Received");
  
}

const transactionWorker = async (job) => {
    try {
        const { userId, transactionId } = job;
        const transaction = await Transaction.findOne({
            _id: transactionId,
            status: "QUEUED",
        });
        if (!transaction) throw new ApiError(404, "Transaction Not Found");

        const sender = await findUserById(transaction.from, "Sender Not Found");
        const receiver = await findUserById(transaction.to, "Receiver Not Found");

        await processTransaction(sender, receiver, transaction);
    } catch (error) {
        console.error("Error:", error.message);
        if (error instanceof ApiError) {
            await notificationQueue(job.userId, "TRANSACTION_FAILED", error.message);
        }
    }
};

export { transactionWorker };
