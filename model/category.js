const mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
  name: { type: String, require: true, unique: true },
  isActive: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now },
});

var Category = mongoose.model("Categorys", categorySchema, "categorys");
module.exports = Category;
