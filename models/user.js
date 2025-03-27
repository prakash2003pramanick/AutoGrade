const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    picture: { type: String },
    google: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Create User Model
module.exports = mongoose.model("User", userSchema);
