const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  total: { type: Number, default: 0 },
  status: { type: String },
});

var Order = mongoose.model("Orders", orderSchema, "orders");
module.exports = Order;
