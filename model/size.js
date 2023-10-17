const mongoose = require("mongoose");

var sizeSchema = new mongoose.Schema({
  productSize: { type: String, require: true, unique: true },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Size = mongoose.model("Sizes", sizeSchema, "sizes");
module.exports = Size;
