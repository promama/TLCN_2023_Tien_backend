const mongoose = require("mongoose");

var cartSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  total: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
});

var Cart = mongoose.model("Carts", cartSchema, "carts");
module.exports = Cart;
