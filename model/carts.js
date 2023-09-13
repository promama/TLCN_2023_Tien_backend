const mongoose = require("mongoose");

var cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  products: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
      quantity: { type: Number },
      price: { type: Number },
      name: { type: String, ref: "products" },
      url: { type: String },
      status: { type: String },
      modify_date: { type: Date, default: Date.now },
    },
  ],
  total: { type: Number, default: 0 },
});

var Cart = mongoose.model("Carts", cartSchema, "carts");
module.exports = Cart;
