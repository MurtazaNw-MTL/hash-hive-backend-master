const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let account = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      unique: true
    },
    metamaskAddress: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

let AccountSchema = mongoose.model("user_account", account);
module.exports = AccountSchema;
