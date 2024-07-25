const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let games = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"]
    }
  },
  { timestamps: true }
);

let GameSchema = mongoose.model("game", games);
module.exports = GameSchema;
