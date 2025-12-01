import mongoose, { Schema, Document, models } from "mongoose";

export interface IInvestment {
  plan: "beginner" | "standard" | "business";
  amount: number;
  dailyReturn: number; // %
  startDate: Date;
  active: boolean;
}

export interface IUser extends Document {
  username: string;
  fullname: string;
  email: string;
  phone: string;
  password: string;
  currency: string;
  country: string;
  referral?: string;
  role: string;
  resetToken?: string;
  resetTokenExpire?: number;
  createdAt: Date;

  // BALANCES
  accountBalance: number;
  totalProfit: number;
  totalDeposit: number;
  totalWithdrawal: number;
  referralBonus: number;

  // WALLET TRANSACTIONS
  deposits: {
    coin: string;
    amount: number;
    screenshot?: string;
    status: "pending" | "approved" | "rejected";
    date: Date;
  }[];

  withdrawals: {
    coin: string;
    amount: number;
    address: string;
    status: "pending" | "approved" | "rejected";
    date: Date;
  }[];

  // INVESTMENTS
  investments: IInvestment[];
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    currency: { type: String, required: true },
    country: { type: String, required: true },
    referral: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetToken: { type: String },
    resetTokenExpire: { type: Number },
    createdAt: { type: Date, default: Date.now },

    // Balances
    accountBalance: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    totalDeposit: { type: Number, default: 0 },
    totalWithdrawal: { type: Number, default: 0 },
    referralBonus: { type: Number, default: 0 },

    // Deposit records
    deposits: {
      type: [
        {
          coin: String,
          amount: Number,
          screenshot: String,
          status: { type: String, default: "pending" },
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    withdrawals: {
      type: [
        {
          coin: String,
          amount: Number,
          address: String,
          status: { type: String, default: "pending" },
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    investments: {
      type: [
        {
          plan: String,
          amount: Number,
          dailyReturn: Number,
          startDate: Date,
          active: Boolean,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// export default mongoose.models.User || mongoose.model("User", UserSchema);
const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
