const mongoose = require("mongoose");

var historySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  income: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

var History = mongoose.model("Historys", historySchema, "historys");
module.exports = History;
