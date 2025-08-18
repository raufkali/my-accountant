const mongoose = require("mongoose");
mongoose.models = {};
const OrderSchema = new mongoose.Schema({
  // person: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Person",
  //   required: true,
  // },

  name: { type: String, required: true },
  rate: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
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
