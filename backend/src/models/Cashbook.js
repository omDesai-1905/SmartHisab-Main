import mongoose from "mongoose";

const cashbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
cashbookSchema.index({ userId: 1, date: -1 });
cashbookSchema.index({ userId: 1, type: 1 });

const Cashbook =
  mongoose.models.Cashbook || mongoose.model("Cashbook", cashbookSchema);

export default Cashbook;
