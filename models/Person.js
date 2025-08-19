// models/Person.js
const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "Ali", "ExchangeShop"
    type: {
      type: String,
      enum: ["buyer", "seller", "both", "self"],
      default: "both",
    },
    contact: String, // optional
    notes: String, // optional
    balance: { type: Number, default: 0 }, // running balance (optional)
    product: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Person", personSchema);
