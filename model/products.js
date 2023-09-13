const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  url: { type: String, default: "" },
  category: { type: String },
  brand: { type: String },
  description: { type: String },
  price: { type: Number, require: true },
  remain: { type: Number, require: true, default: 0 },
  create_at: { type: Date, default: Date.now },
});

var Product = mongoose.model("Products", productSchema, "products");
module.exports = Product;
