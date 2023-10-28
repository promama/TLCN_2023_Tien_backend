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
  url: {
    type: String,
    default: "https://ananas.vn/wp-content/uploads/Pro_AV00200_1.jpg",
  },
  url1: {
    type: String,
    default: "https://ananas.vn/wp-content/uploads/Pro_AV00200_2.jpg",
  },
  url2: {
    type: String,
    default: "https://ananas.vn/wp-content/uploads/Pro_AV00200_3.jpg",
  },
  url3: {
    type: String,
    default: "https://ananas.vn/wp-content/uploads/Pro_AV00200_4.jpg",
  },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Color = mongoose.model("Colors", colorSchema, "colors");
module.exports = Color;
