const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Privacy = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

let Privacychema = mongoose.model("roadmap", Privacy);
module.exports = Privacychema;
