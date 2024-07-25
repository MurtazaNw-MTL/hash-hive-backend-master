const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let gamePlayCount = new Schema(
  {
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "game",
        required: true,
    },
    playedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    session: [
      {
        createdAt: {
          type: Date,
          default: Date.now
        },
        score : Number
      }
    ],
  },
);

let gamePlayCountSchema = mongoose.model("gamePlayCount", gamePlayCount);
module.exports = gamePlayCountSchema;