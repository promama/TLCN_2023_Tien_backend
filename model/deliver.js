const mongoose = require("mongoose");

var deliverSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    unique: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: { type: String, require: true },
  phoneNumber: { type: String },
  birthDay: { type: String },
  sex: { type: String },
  refreshToken: { type: [String], default: "" },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Deliver = mongoose.model("Delivers", deliverSchema, "delivers");
module.exports = Deliver;
