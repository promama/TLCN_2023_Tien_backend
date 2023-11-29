const mongoose = require("mongoose");

var addressSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  isDefault: { type: Boolean, default: false },
});

var Address = mongoose.model("Addresss", addressSchema, "addresss");
module.exports = Address;
