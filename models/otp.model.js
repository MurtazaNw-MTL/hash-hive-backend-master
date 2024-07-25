const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Otp = new Schema(
  {
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    otp: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

let OtpSchema = mongoose.model("otp", Otp);
module.exports = OtpSchema;
