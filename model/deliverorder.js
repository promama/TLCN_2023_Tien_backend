const mongoose = require("mongoose");

var deliverorderSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  deliverId: { type: mongoose.Schema.Types.ObjectId, ref: "delivers" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
  name: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  total: { type: Number, default: 0 },
  finishUri: { type: String },
  failReason: { type: String, default: "" },
  status: { type: String },
  create_at: { type: Date, default: Date.now },
});

var Deliverorder = mongoose.model(
  "Deliverorders",
  deliverorderSchema,
  "deliverorders"
);
module.exports = Deliverorder;
