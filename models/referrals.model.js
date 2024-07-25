const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let referral = new Schema(
  {
    referredTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    },
    amount: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      required: true
    },
    isUpdated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

let ReferralSchema = mongoose.model("referral", referral);
module.exports = ReferralSchema;
