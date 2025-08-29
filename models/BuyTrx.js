const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const buySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link transaction to user

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link transaction to user
  buyerName: { type: String, required: true },
  sellerName: { type: String, required: true },
  buyingRate: { type: Number, required: true },
  totQuantity: { type: Number, required: true },
  payingMethod: {
    type: String,
    enum: ["paid", "unpaid", "payToCreditor"],
    required: true,
  },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BuyTrx", buySchema);
