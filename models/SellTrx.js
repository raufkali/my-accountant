const mongoose = require("mongoose");

// Debtor sub-schema
const debtorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const sellSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link transaction to user

  type: {
    type: String,
    default: "sell",
  },
  sellerName: {
    type: String,
    required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  sellingRate: {
    type: Number,
    required: true,
  },
  totQuantity: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payingMethod: {
    type: String,
    enum: ["paid", "unpaid", "payToDebtor"],
    default: "unpaid",
  },
  numOfDebtors: {
    type: Number,
    default: 0,
  },
  debtors: {
    type: [debtorSchema], // array of debtor docs
    validate: {
      validator: function (value) {
        // only required if payingMethod is "payToDebtor"
        if (this.payingMethod === "payToDebtor") {
          return value.length > 0;
        }
        return true;
      },
      message: "Debtors required when payingMethod is 'payToDebtor'",
    },
  },
  note: String,
});

module.exports = mongoose.model("SellTrx", sellSchema);
