import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
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
  },
  {
    timestamps: true,
  }
);

const Supplier =
  mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default Supplier;
