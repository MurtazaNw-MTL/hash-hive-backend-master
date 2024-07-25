const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let payments = new Schema(
    {
        moneroPaymentTimeStamp: Number,
        amount: Number,
        txnHash: String,
        totalValidShare: Number,
        identifiers: [],
        minedData: {}
    },
    { timestamps: true }
);

let MiningSchema = mongoose.model("payment", payments);
module.exports = MiningSchema;
