const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    resetPasswordToken: String,  // Add this field
    resetPasswordExpires: Date,   // Add this field
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    isInitialAdmin: {
      type: Boolean,
      default: false
    }
  })
);

module.exports = User;
