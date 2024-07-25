const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Setting = new Schema(
    {
        minWithdrawAmount: {
            type: Number,
            default: 10
        },
        platformWallet: {
            type: String,
            default: null
        },
        platformFee: { type: Number, default: 0 }
    },
    { timestamps: true }
);

let SettingSchema = mongoose.model("Setting", Setting);
module.exports = SettingSchema;
