const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");

module.exports.deleteAllUser = async (req, res) => {};

module.exports.deleteUser = async (req, res) => {
  const email = req.body.email;
  const result = await User.find({ email: email }).exec();
  const cart = await Cart.findOneAndDelete({ userId: result[0]._id }).exec();
  User.findOneAndDelete({ email: email }).exec();
};
