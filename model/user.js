const mongoose = require("mongoose");

const userSchema = {
  email: String,
  password: String,
};

const user = mongoose.model("user", userSchema);
