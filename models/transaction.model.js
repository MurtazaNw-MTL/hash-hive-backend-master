const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let trasaction = new Schema(
  {
    walletAddress: {
      type: String
    },
    paymentMode: {
      type: String,
      enum: ["METAMASK"],
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    rejectMessage: String
  },
  { timestamps: true }
);

let TransactionSchema = mongoose.model("trasactionn", trasaction);
module.exports = TransactionSchema;
