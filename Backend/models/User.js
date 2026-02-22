const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    healthcondition: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Modern async pre-save hook (No 'next' needed)
userSchema.pre("save", async function () {
  // If the password wasn't modified, just exit the hook
  if (!this.isModified("password")) {
    return;
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
