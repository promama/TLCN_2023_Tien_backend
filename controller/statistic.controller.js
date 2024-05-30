const mongoose = require("mongoose");
const Order = require("../model/order");
const User = require("../model/users");
const ProductInCart = require("../model/productincart");
const Cart = require("../model/carts");
const History = require("../model/history");
const Income = require("../model/income");
const Product = require("../model/products");

const dayjs = require("dayjs");
const { ObjectId } = require("mongodb");
dayjs().format();

//test income history
module.exports.incomeByStatus = async (req, res) => {
  const order = await Order.aggregate([
    {
      $group: {
        _id: {
          status: "$status",
        },
        totalAmount: { $sum: "$total" },
      },
    },
  ]);

  if (order.length < 1) {
    return res.status(400).json({
      success: false,
      message: "smth wrong",
    });
  }

  const label = [];
  const data = [];
  const color = [];

  order.map((item) => {
    if (item._id.status == "In cart") {
      label.push(item._id.status);
      data.push(item.totalAmount);
      color.push("blue");
    } else if (item._id.status == "Waiting approve") {
      label.push(item._id.status);
      data.push(item.totalAmount);
      color.push("#ff6500");
    } else if (item._id.status == "Delivering") {
      label.push(item._id.status);
      data.push(item.totalAmount);
      color.push("#00f6ff");
    } else if (item._id.status == "Finish") {
      label.push(item._id.status);
      data.push(item.totalAmount);
      color.push("#1bff00");
    } else if (item._id.status == "Cancelled") {
      label.push(item._id.status);
      data.push(item.totalAmount);
      color.push("#ff2525");
    }
  });

  return res.status(200).json({
    success: true,
    message: "here",
    incomeByStatus: { label, data, color },
  });
};

module.exports.statisticIncomeByMonth = async (req, res) => {
  const income = await Income.find().sort({ year: 1, month: 1 });
  const label = [];
  const data = [];

  if (income.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive incomes",
    });
  }

  income.map((item) => {
    label.push(item.month.concat("/", item.year));
    data.push(item.income);
  });

  return res.status(200).json({
    success: true,
    message: "success",
    incomeByMonth: { label, data },
  });
};

module.exports.generalStatistic = async (req, res) => {
  const income = await Income.find().sort({ year: -1, month: -1 });
  const product = await Product.find();
  const user = await User.find();
  var total = 0;

  if (income.length < 1 || product.length < 1 || user.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive incomes",
    });
  }

  income.map((item) => {
    total += item.income;
  });

  return res.status(200).json({
    success: true,
    message: "ok",
    general: {
      monthly: income[0].income,
      total,
      product: product.length,
      user: user.length,
    },
  });
};
