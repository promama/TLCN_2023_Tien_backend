const mongoose = require("mongoose");
const Order = require("../model/order");
const User = require("../model/users");
const ProductInCart = require("../model/productincart");
const Cart = require("../model/carts");
const History = require("../model/history");
const Income = require("../model/income");

const dayjs = require("dayjs");
const { ObjectId } = require("mongodb");
const Product = require("../model/products");
dayjs().format();

var cron = require("node-cron");

cron.schedule("*/10 * * * *", async () => {
  console.log("running a task every minute");

  const order = await Order.find({ status: "Delivering" });

  if (order.length < 1) {
    console.log("no order is in delivering status");
  } else {
    for (let index = 0; index < order.length; index++) {
      if (dayjs(order[index].date).add(3, "day") <= dayjs(Date.now())) {
        console.log(order[index]._id);

        //find products in cart for product id
        //then find product with id
        //update sold of product
        const products = await ProductInCart.find({
          orderId: order[index]._id,
        });

        for (let index = 0; index < products.length; index++) {
          await Product.findOneAndUpdate(
            {
              _id: products[index].productId,
            },
            {
              $inc: {
                sold: products[index].quantity,
              },
            }
          );
        }

        await History.create({
          _id: new ObjectId(),
          orderId: order[index]._id,
          name: order[index].name,
          phoneNumber: order[index].phoneNumber,
          address: order[index].address,
          total: order[index].total,
          status: "Finish",
        });

        const now = new Date();
        let yyyy = now.getFullYear();
        let mm = now.getMonth() + 1;
        let dd = now.getDate() + 1;

        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;

        const income = await Income.find({
          date: yyyy + "/" + mm + "/" + dd,
        });

        if (income.length < 1) {
          await Income.create({
            _id: new ObjectId(),
            income: order[index].total,
            date: yyyy + "/" + mm + "/" + dd,
          });
        } else {
          await Income.findOneAndUpdate(
            {
              date: yyyy + "/" + mm + "/" + dd,
            },
            { $inc: { income: order[index].total } }
          );
        }

        await Order.findOneAndUpdate(
          { _id: order[index]._id },
          { $set: { status: "Finish", date: dayjs().toDate() } }
        );
        await ProductInCart.updateMany(
          { orderId: order[index]._id, status: "Delivering" },
          {
            $set: {
              status: "Finish",
              modify_date: dayjs().toDate(),
              allowRating: true,
              rating: -1,
            },
          }
        );
      }
    }
  }
});

module.exports.checkOrder = async (req, res) => {
  const order = await Order.find({
    userId: req.body.userId,
    cartId: req.body.cartId,
    status: "In cart",
  });

  return res.json({
    data: order,
  });
};

module.exports.getAllOrderById = async (req, res) => {
  console.log("top showing req.body: ");
  console.log(req.body);
  const listStatus = [0, 0, 0, 0, 0];
  const listOrder = [];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderId", "$$order_id"] },
                  { $eq: ["$userId", req.body.userId[0]._id] },
                ],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
      listStatus[0]++;
      if (order.status === "Waiting approve") {
        listStatus[1]++;
      } else if (order.status === "Delivering") {
        listStatus[2]++;
      } else if (order.status === "Cancel") {
        listStatus[3]++;
      } else if (order.status === "Finish") {
        listStatus[4]++;
      }
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
    listStatus,
  });
};

module.exports.getWaitingApproveOrder = async (req, res) => {
  console.log("top showing req.body: ");
  const listOrder = [];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderId", "$$order_id"] },
                  { $eq: ["$userId", req.body.userId[0]._id] },
                  { $eq: ["$status", "Waiting approve"] },
                ],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
  });
};

module.exports.getDeliveringOrder = async (req, res) => {
  console.log("top showing req.body: ");
  const listOrder = [];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderId", "$$order_id"] },
                  { $eq: ["$userId", req.body.userId[0]._id] },
                  { $eq: ["$status", "Delivering"] },
                ],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
  });
};

module.exports.getFinishOrder = async (req, res) => {
  console.log("top showing req.body: ");
  const listOrder = [];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderId", "$$order_id"] },
                  { $eq: ["$userId", req.body.userId[0]._id] },
                  { $eq: ["$status", "Finish"] },
                ],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
  });
};

module.exports.postUserConfirmOrder = async (req, res) => {
  const { orderId, addressInfos } = req.body;
  console.log(req.body);

  if (Object.keys(addressInfos).length < 1) {
    return res.status(400).json({
      success: false,
      message: "Please choose an address",
    });
  }

  try {
    await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: "Waiting approve",
          address: addressInfos.address,
          name: addressInfos.name,
          phoneNumber: addressInfos.phoneNumber,
        },
      }
    );

    await ProductInCart.updateMany(
      { orderId: orderId, status: "In cart" },
      { $set: { status: "Waiting approve" } }
    );

    await Cart.updateOne(
      { userId: req.body.userId[0]._id },
      { $set: { total: 0, quantity: 0 } }
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Fail to confirm ",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Confirm success",
    token: req.body.token,
  });
};

//admin function
//get all orders
module.exports.getAllOrderAdmin = async (req, res) => {
  console.log("top showing req.body: ");
  const listOrder = [];
  //[Waiting approve, Delivering, Finish, Cancelled, Total]
  const countEachOrder = [0, 0, 0, 0, 0];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$orderId", "$$order_id"] }],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
      if (order.status != "In cart") {
        if (order.status === "Waiting approve") {
          countEachOrder[0] = countEachOrder[0] + 1;
          countEachOrder[4] = countEachOrder[4] + 1;
        }
        if (order.status === "Delivering") {
          countEachOrder[1] = countEachOrder[1] + 1;
          countEachOrder[4] = countEachOrder[4] + 1;
        }
        if (order.status === "Finish") {
          countEachOrder[2] = countEachOrder[2] + 1;
          countEachOrder[4] = countEachOrder[4] + 1;
        }
        if (order.status === "Cancelled") {
          countEachOrder[3] = countEachOrder[3] + 1;
          countEachOrder[4] = countEachOrder[4] + 1;
        }
      }
    }
  });
  console.log(listOrder);
  console.log(countEachOrder);
  return res.json({
    success: true,
    listOrder,
    countEachOrder,
  });
};

module.exports.getAllDeliveryOrderAdmin = async (req, res) => {
  console.log("top showing req.body: ");
  const listOrder = [];
  const data = await Order.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$orderId", "$$order_id"] },
                  { $eq: ["$status", "Delivering"] },
                ],
              },
            },
          },
        ],
        as: "data",
      },
    },
  ]);
  data.map((order) => {
    if (order.data.length > 0) {
      const tempList = {
        userId: order.userId,
        orderId: order._id,
        status: order.status,
        total: order.total,
        address: order.address,
        name: order.name,
        phoneNumber: order.phoneNumber,
        productInOrder: [...order.data],
      };
      listOrder.push(tempList);
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
  });
};

module.exports.approveOrder = async (req, res, next) => {
  console.log(req.body);

  try {
    await Order.findOneAndUpdate(
      { _id: req.body.productInfos.orderId },
      { $set: { status: "Delivering" } }
    );
    await ProductInCart.updateMany(
      { orderId: req.body.productInfos.orderId, status: "Waiting approve" },
      { $set: { status: "Delivering", date: dayjs().toDate() } }
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Approve order fail",
    });
  }

  next();
};

module.exports.finishOrder = async (req, res, next) => {
  console.log(req.body);

  try {
    const order = await Order.find({
      _id: req.body.orderId,
    });

    if (order.length < 1) {
      return res.status(400).json({
        success: false,
        message: "No Order found",
      });
    }

    //find products in cart for product id
    //then find product with id
    //update sold of product
    const products = await ProductInCart.find({
      orderId: req.body.orderId,
    });

    if (products.length < 1) {
      return res.status(400).json({
        success: false,
        message: "No Product found",
      });
    }

    for (let index = 0; index < products.length; index++) {
      await Product.findOneAndUpdate(
        {
          _id: products[index].productId,
        },
        {
          $inc: {
            sold: products[index].quantity,
          },
        }
      );
    }

    await History.create({
      _id: new ObjectId(),
      orderId: order[0]._id,
      name: order[0].name,
      phoneNumber: order[0].phoneNumber,
      address: order[0].address,
      total: order[0].total,
      status: "Finish",
    });

    const now = new Date();
    let yyyy = now.getFullYear();
    let mm = now.getMonth() + 1;
    let dd = now.getDate() + 1;

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    const income = await Income.find({
      date: yyyy + "/" + mm + "/" + dd,
    });

    if (income.length < 1) {
      await Income.create({
        _id: new ObjectId(),
        income: order[0].total,
        date: yyyy + "/" + mm + "/" + dd,
      });
    } else {
      await Income.findOneAndUpdate(
        {
          date: yyyy + "/" + mm + "/" + dd,
        },
        { $inc: { income: order[0].total } }
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Finish order fail 1",
    });
  }

  try {
    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      { $set: { status: "Finish", date: dayjs().toDate() } }
    );
    await ProductInCart.updateMany(
      { orderId: req.body.orderId, status: "Delivering" },
      {
        $set: {
          status: "Finish",
          modify_date: dayjs().toDate(),
          allowRating: true,
          rating: -1,
        },
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Finish order fail 2",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order is finished",
    token: req.body.token,
  });
};

module.exports.cancelOrder = async (req, res) => {
  console.log(req.body);
  try {
    await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      { $set: { status: "Cancelled", date: dayjs().toDate() } }
    );
    await ProductInCart.updateMany(
      { orderId: req.body.orderId, status: "Waiting approve" },
      {
        $set: {
          status: "Cancelled",
          modify_date: dayjs().toDate(),
          allowRating: false,
          rating: -1,
        },
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Finish order fail 2",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order is cancelled",
    token: req.body.token,
  });
};

//test income history
module.exports.testIncomeHistory1 = async (req, res) => {
  const order = await Order.aggregate([
    //cut date to month an year field with total
    {
      $project: {
        day: { $substr: ["$date", 8, 2] },
        month: { $substr: ["$date", 5, 2] },
        year: { $substr: ["$date", 0, 4] },
        total: "$total",
      },
    },
    //sort asc
    {
      $sort: { month: -1 },
    },
    //group by month and year
    {
      $group: {
        _id: {
          day: "$day",
          month: "$month",
          year: "$year",
        },
        totalAmount: { $sum: "$total" },
      },
    },
    // {
    //   $group: {
    //     _id: { year: "$_id.year" },
    //     day: { $push: { day: "$_id.day", total: "$totalAmount" } },
    //   },
    // },
    //find month match
    // {
    //   $match: {
    //     $expr: {
    //       $eq: ["$_id.month", "03"],
    //     },
    //   },
    // },
  ]);

  console.log(dayjs().toDate());

  return res.json(order);
};

module.exports.testIncomeHistory = async (req, res) => {
  //yearly income
  let yearlyLabel = [];
  let yearlyData = [];
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
    yearlyLabel.push(item._id.year);
    yearlyData.push(item.income);
  });

  //monthly income
  let monthlyLabel = [];
  let monthlyData = [];
  const monthlyIncome = await Income.aggregate([
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

  if (monthlyIncome.length < 1) {
    return res.status(200).json({
      success: false,
      message: "fail to receive monthly incomes",
    });
  }

  monthlyIncome.map((item) => {
    monthlyLabel.push(item._id.month.concat("/", item._id.year));
    monthlyData.push(item.income);
  });

  return res.json({
    yearly: { yearlyLabel, yearlyData },
    monthly: { monthlyLabel, monthlyData },
  });
};
