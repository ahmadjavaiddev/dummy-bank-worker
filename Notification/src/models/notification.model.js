import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User Id is required"],
        },
        type: {
            type: String,
            enum: [
                "LOGIN",
                "TRANSACTION",
                "VERIFICATION",
                "TRANSACTION_FAILED",
                "MPIN",
                "CARD",
                "PAYMENT",
            ],
            required: [true, "Type is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
