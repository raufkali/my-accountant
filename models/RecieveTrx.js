const mongoose = require("mongoose");

const receiveSchema = new mongoose.Schema({
  receiverName: { type: String, required: true },
  senderName: { type: String, required: true },
  amount: { type: Number, default: 0 },
  product: { type: Number, default: 0 },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReceiveTrx", receiveSchema);
