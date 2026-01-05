import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: { type: String, required: true },
    type: { type: String, enum: ["debit", "credit"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
