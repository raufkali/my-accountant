const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  transactions: {
    sendTransactions: [transactionSchema],
    sellTransactions: [transactionSchema],
    receiverTransactions: [transactionSchema],
    buyTransactions: [transactionSchema],
  },
});

module.exports = mongoose.model("Account", accountSchema);
