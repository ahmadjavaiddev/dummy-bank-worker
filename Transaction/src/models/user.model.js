import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: false,
            trim: true,
        },
        userName: {
            type: String,
            required: [true, "Last name is required"],
            unique: [true, "UserName Should be unique"],
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email Should be unique"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        IBAN: {
            type: String,
            required: [true, "IBAN is required"],
            unique: [true, "IBAN should be Unique"],
        },
        accountNumber: {
            type: String,
            required: [true, "accountNumber is required"],
            unique: [true, "accountNumber should be Unique"],
        },
        mPin: {
            code: {
                type: String,
                default: "",
            },
            key: {
                type: String,
                default: "",
            },
            iv: {
                type: String,
                default: "",
            },
            enabled: {
                type: Boolean,
                default: false,
            },
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isLoggedIn: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        verificationExpiry: {
            type: Date,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordTokenExpiry: {
            type: Date,
        },
        haveCard: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: "user",
            enum: ["user", "admin"],
        },
        refreshToken: {
            type: String,
        },
        balance: {
            type: Number,
            default: 0,
        },
        virtualCard: {
            number: String,
            expiry: Date,
            cvv: String,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
