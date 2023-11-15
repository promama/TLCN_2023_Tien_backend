const mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  name: { type: String, ref: "products" },
  quantity: { type: Number },
  price: { type: Number },
  totalIncome: { type: Number, default: 0 },
  month: { type: Number },
  year: { type: Number },
});

var History = mongoose.model("Historys", historySchema, "historys");
module.exports = History;
