const mongoose = require("mongoose");

var brandSchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Brand = mongoose.model("Brands", brandSchema, "brands");
module.exports = Brand;
