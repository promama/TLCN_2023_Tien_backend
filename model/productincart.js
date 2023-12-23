const mongoose = require("mongoose");

var productincartSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
  productName: { type: String, ref: "products" },
  url: { type: String, ref: "colors" },
  quantity: { type: Number },
  price: { type: Number },
  status: { type: String, default: "In cart" },
  color: { type: String },
  size: { type: Number },
  modify_date: { type: Date, default: Date.now },
});

var ProductInCart = mongoose.model(
  "ProductInCarts",
  productincartSchema,
  "productincarts"
);
module.exports = ProductInCart;
