const mongoose = require("mongoose");

const receiveSchema = new mongoose.Schema({
  receiverName: { type: String, required: true },
  senderName: { type: String, required: true },
  amount: { type: Number, default: 0 },
  payDebt: { type: Boolean, required: true },
  type: {
    type: String,
    enum: ["amount", "product", "both"],
    required: true,
  },
  product: { type: Number, default: 0 },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReceiveTrx", receiveSchema);
