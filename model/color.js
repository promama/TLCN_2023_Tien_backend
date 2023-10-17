const mongoose = require("mongoose");

var colorSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  sizes: [
    {
      sizeId: { type: mongoose.Schema.Types.ObjectId, ref: "sizes" },
      productSize: { type: String, ref: "sizes", default: 35 },
      quantity: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
    },
  ],
  productColor: { type: String, require: true, default: "white" },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Color = mongoose.model("Colors", colorSchema, "colors");
module.exports = Color;
