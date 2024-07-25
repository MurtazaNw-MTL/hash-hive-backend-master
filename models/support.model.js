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
    }
  },
  { timestamps: true }
);

let SupportModel = mongoose.model("support", Privacy);
module.exports = SupportModel;
