const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Validator = require("validator");

let user = new Schema(
  {
    userName: {
      type: String,
      default: null
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    profileImage: {
      type: String,
      default: null
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: value => Validator.isEmail(value),
        message: "Invalid email address"
      }
    },
    mobileNumber: {
      type: String,
      validate: {
        validator: value =>
          Validator.isMobilePhone(value, "any", { strictMode: false }),
        message: "Invalid mobile number"
      }
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },
    status: {
      type: Boolean,
      default: false
    },

    city: {
      type: String
    },
    countryCode: {
      type: String
    },
    isBlocked: {
      status: { type: Boolean, default: false },
      message: String
    },
    country: {
      type: String
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_account"
    },
    loginMethod: {
      type: String,
      enum: ["EMAIL_PASSWORD", "GOOGLE"]
    },
    walletAddress: { type: String },
    referralCode: { type: String, required: true },
    walletAmount: { type: Number, default: 0 },
    lock: { type: Number, default: 0 },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // id of user to whome he referred by
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "referral" }], //  id of referrals  (referral send by this user)
    registeredReferral: {
      // this is referral id generated during registeration using referral code.
      type: mongoose.Schema.Types.ObjectId,
      ref: "referral"
    }
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("user", user);
module.exports = UserSchema;
