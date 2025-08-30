const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String }, // make _id a string
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

// Before saving, set _id = email
userSchema.pre("save", function (next) {
  this._id = this.email;
  next();
});

module.exports = mongoose.model("User", userSchema);
