const mongoose = require("mongoose");

var sizeSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  productColor: { type: String, default: "White" },
  productSize: { type: Number, require: true },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Size = mongoose.model("Sizes", sizeSchema, "sizes");
module.exports = Size;
