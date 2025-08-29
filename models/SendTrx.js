const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const sendSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link transaction to user

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
