const mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  name: { type: String, ref: "products" },
  quantity: { type: Number },
  price: { type: Number },
  url: { type: String },
  status: { type: String },
  color: { type: String },
  size: { type: Number },
  modify_date: { type: Date, default: Date.now },
});

var History = mongoose.model("Historys", historySchema, "historys");
module.exports = History;
