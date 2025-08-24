const mongoose = require("mongoose");

const sendSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
  amount: { type: Number, default: 0 },
  product: { type: Number, default: 0 },
  payDebt: { type: Boolean, required: true },
  type: {
    type: String,
    enum: ["amount", "product", "both"],
    required: true,
  },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SendTrx", sendSchema);
