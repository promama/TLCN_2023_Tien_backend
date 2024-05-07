const mongoose = require("mongoose");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const userSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    unique: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: { type: String, require: true },
  status: { type: String, require: true, default: "Active" },
  role: { type: String, require: true, default: "User" },
  phoneNumber: { type: String },
  address: { type: String },
  refreshToken: { type: [String], default: "" },
  avatar: { type: String },
  sex: { type: String },
  birthDay: { type: String },
  create_at: { type: Date, default: Date.now },
});

const User = mongoose.model("Users", userSchema, "users");
module.exports = User;
