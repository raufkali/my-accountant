const mongoose = require("mongoose");

const buySchema = new mongoose.Schema({
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
