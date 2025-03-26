const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  google: { type: mongoose.Schema.Types.Mixed, default: null},
}, { timestamps: true });

// Create User Model
const User = mongoose.model('User', userSchema);