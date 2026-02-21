import mongoose from "mongoose";

const customerMessageSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    subject: {
      type: String,
      required: false, // Made optional for chat messages
    },
    message: {
      type: String,
      required: true,
    },
    // Chat specific fields
    senderType: {
      type: String,
      enum: ["user", "customer"],
      required: true,
      default: "customer",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["dispute", "general", "complaint", "chat"],
      default: "chat",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const CustomerMessage =
  mongoose.models.CustomerMessage ||
  mongoose.model("CustomerMessage", customerMessageSchema);

export default CustomerMessage;
