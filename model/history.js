const mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
  name: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  total: { type: Number },
  status: { type: String, default: "Finish" },
  modify_date: { type: Date, default: Date.now },
});

var History = mongoose.model("Historys", historySchema, "historys");
module.exports = History;
