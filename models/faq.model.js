const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let faq = new Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

let FaqSchema = mongoose.model("faq", faq);
module.exports = FaqSchema;
