const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number },
  product: { type: Number },
  trxId: { type: mongoose.Schema.Types.ObjectId, ref: "SellTrx" }, // optional link
  date: { type: Date, default: Date.now },
  note: { type: String },
});

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link transaction to user

  name: {
    type: String,
    required: true,
  },
  product: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  transactions: {
    sendTransactions: [transactionSchema],
    sellTransactions: [transactionSchema],
    receiverTransactions: [transactionSchema],
    buyTransactions: [transactionSchema],
  },
  debitors: [transactionSchema],
  creditors: [transactionSchema],
});

module.exports = mongoose.model("Account", accountSchema);
