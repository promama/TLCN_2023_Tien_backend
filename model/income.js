const mongoose = require("mongoose");

var incomeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  income: { type: Number, default: 0 },
  month: { type: String },
  year: { type: String },
  date: { type: Date },
});

var Income = mongoose.model("Incomes", incomeSchema, "incomes");
module.exports = Income;
