const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  name: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  total: { type: Number, default: 0 },
  status: { type: String },
  date: { type: Date, default: Date.now },
});

var Order = mongoose.model("Orders", orderSchema, "orders");
module.exports = Order;
