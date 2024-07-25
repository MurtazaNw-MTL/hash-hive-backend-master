const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let miner = new Schema(
    {
        timeStamp: Number,
        validIdentifiers: { type: Object },
        globalIdentifier: [
            {
                lts: Number,
                identifer: String,
                hash: Number,
                hash2: Number,
                totalHash: Number,
                validShares: Number,
                invalidShares: Number
            }
        ]

    },
    { timestamps: true }
);

let MiningSchema = mongoose.model("miner", miner);
module.exports = MiningSchema;
