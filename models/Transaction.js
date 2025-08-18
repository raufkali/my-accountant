const mongoose = require("mongoose");

const debtorSchema = new mongoose.Schema({
  name: String,
  amount: Number,
});

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["send", "receive", "sell", "buy"],
    required: true,
  },
  sellerName: String,
  senderName: String,
  receiverName: String,
  buyerName: String,
  sellingRate: Number,
  buyingRate: Number,
  quantity: Number,
  totalAmount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  payingMethod: {
    type: String,
    enum: ["paid", "unpaid", "payToDebtor"],
  },
  numOfDebtors: Number,
  description: String,
  debtors: [debtorSchema],
});

module.exports = mongoose.model("Transaction", transactionSchema);
