const mongoose = require("mongoose");
mongoose.models = {};

const OrderSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true }, // string instead of ObjectId

  orderFrom: { type: String, required: true },
  orderTo: { type: String, required: true, default: "jawad" },
  rate: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  completionQuantity: { type: Number },
  completionRate: { type: Number },
  completionAmount: { type: Number },
  receiver: { type: String },
  pay: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },

  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
