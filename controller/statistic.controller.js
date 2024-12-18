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
const {
  default: twoDigitYear,
} = require("date-and-time/plugin/two-digit-year");
dayjs().format();

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
    if (item._id.status == "Waiting approve") {
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
  //yearly income
  let label = [];
  let data = [];
  const yearlyIncome = await Income.aggregate([
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        income: "$income",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
        },
        income: { $sum: "$income" },
      },
    },
    {
      $sort: { "_id.year": 1 },
    },
  ]);

  if (yearlyIncome.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive yearly incomes",
    });
  }

  yearlyIncome.map((item) => {
    label.push(item._id.year);
    data.push(item.income);
  });

  return res.status(200).json({
    success: true,
    message: "success",
    stats: { label, data },
  });
};

module.exports.statisticYears = async (req, res) => {
  const result = [];
  const years = await Income.aggregate([
    {
      $project: {
        year: { $substr: ["$date", 0, 4] },
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
        },
      },
    },
    { $sort: { "_id.year": -1 } },
  ]);

  years.map((year) => {
    result.push(year._id.year);
  });

  return res.status(200).json({
    success: true,
    message: "success",
    years: result,
  });
};

module.exports.statisticMonths = async (req, res) => {
  const year = req.params["year"];
  const result = [];
  const months = await Income.aggregate([
    {
      $project: {
        year: { $substr: ["$date", 0, 4] },
        month: { $substr: ["$date", 5, 2] },
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
        },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
  ]);

  months.map((month) => {
    if (month._id.year == year) result.push(month._id.month);
  });

  return res.status(200).json({
    success: true,
    message: "success",
    months: result,
  });
};

module.exports.statisticIncomeByYears = async (req, res) => {
  const year = req.params["year"];
  //monthly income
  let label = [];
  let data = [];
  const yearlyIncome = await Income.aggregate([
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        income: "$income",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
        },
        income: { $sum: "$income" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  if (yearlyIncome.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive monthly incomes",
    });
  }

  yearlyIncome.map((item) => {
    if (item._id.year == year) {
      label.push(item._id.month + "/" + item._id.year);
      data.push(item.income);
    }
  });

  return res.status(200).json({
    success: true,
    message: "success",
    stats: { label, data },
  });
};

module.exports.statisticIncomeByYearAndMonth = async (req, res) => {
  const year = req.params["year"];
  const month = req.params["month"];
  //daily income
  let label = [];
  let data = [];
  const yearlyIncome = await Income.aggregate([
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        income: "$income",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          day: "$day",
        },
        income: { $sum: "$income" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  if (yearlyIncome.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive monthly incomes",
    });
  }

  yearlyIncome.map((item) => {
    if (item._id.year == year && item._id.month == month) {
      label.push(item._id.day + "/" + item._id.month + "/" + item._id.year);
      data.push(item.income);
    }
  });

  return res.status(200).json({
    success: true,
    message: "success",
    stats: { label, data },
  });
};

module.exports.statisticIncomeBetweenTwoDates = async (req, res) => {
  const { from, to } = req.body;

  //income between 2 dates
  let label = [];
  let data = [];

  if (from == null || to == null) {
    return res.status(400).json({
      success: false,
      message: "please choose 2 dates",
    });
  }
  console.log(req.body);

  const yearlyIncome = await Income.aggregate([
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        income: "$income",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          day: "$day",
        },
        income: { $sum: "$income" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  if (yearlyIncome.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive between 2 dates incomes",
    });
  }

  yearlyIncome.map((item) => {
    const dateConvert = dayjs(
      item._id.year + "/" + item._id.month + "/" + item._id.day
    );
    if (dayjs(dateConvert) >= dayjs(from) && dayjs(dateConvert) <= dayjs(to)) {
      label.push(item._id.day + "/" + item._id.month + "/" + item._id.year);
      data.push(item.income);
    }
  });

  return res.status(200).json({
    success: true,
    message: "success",
    stats: { label, data },
  });
};

module.exports.generalStatistic = async (req, res) => {
  // const income = await Income.find().sort({ year: -1, month: -1 });
  const income = await Income.aggregate([
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        income: "$income",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
        },
        income: { $sum: "$income" },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
  ]);
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

//testing
module.exports.testingStats = async (req, res) => {
  //const date = [];
  // const history = await History.find({ status: "Finish" });
  // const income = await Income.find({});

  // var date1 = new Date();
  // let yyyy = date1.getFullYear();
  // let mm = date1.getMonth() + 1;
  // let dd = date1.getDate() + 1;

  // if (dd < 10) dd = "0" + dd;
  // if (mm < 10) mm = "0" + mm;

  // const date1_format = yyyy + "/" + mm + "/" + dd;
  const date1_format = "2024/05/08";

  for (let index = 2; index < 31; index++) {
    var random = Math.floor(Math.random() * 30 + 10);
    var dd = index;

    if (dd < 10) dd = "0" + dd;
    var date = "2023/10/" + dd;

    await Income.create({
      _id: new mongoose.Types.ObjectId(),
      income: random,
      date: date,
    });
  }

  // await Income.create({
  //   _id: new mongoose.Types.ObjectId(),
  //   income: req.body.income,
  //   date: req.body.date,
  // });

  // const date = await Income.find({ date: "2024/05/02" });

  // if (date1.getTime() > date2.getTime()) {
  //   message = "date1 > date 2";
  // } else {
  //   message = "date1 < date2";
  // }

  // for (let index = 0; index < history.length; index++) {
  //   date.push({
  //     day: history[index].modify_date.getDate(),
  //     month: history[index].modify_date.getMonth(),
  //     year: history[index].modify_date.getFullYear(),
  //     total: history[index].total,
  //   });
  // }

  // for (let index = 0; index < history.length; index++) {
  //   date.push({
  //     date: history[index].modify_date,
  //     income: history[index].total,
  //   });
  // }

  return res.json({
    date1_format,
  });
};
