const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  price: { type: Number, default: 0 },
  url: { type: String },
  category: { type: String, ref: "category" },
  brand: { type: String, ref: "brand" },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Product = mongoose.model("Products", productSchema, "products");
module.exports = Product;
