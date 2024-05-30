const mongoose = require("mongoose");
const Order = require("../model/order");
const User = require("../model/users");
const ProductInCart = require("../model/productincart");
const Cart = require("../model/carts");
const History = require("../model/history");
const Income = require("../model/income");

const dayjs = require("dayjs");
const { ObjectId } = require("mongodb");
dayjs().format();

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
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
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
    }
  });
  console.log(listOrder);
  return res.json({
    success: true,
    listOrder,
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
      { $set: { status: "Delivering" } }
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
      _id: req.body.productInfos.orderId,
    });

    if (order.length < 1) {
      return res.status(400).json({
        success: false,
        message: "No Order found",
      });
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

    const income = await Income.find({
      month: dayjs().month() + 1,
      year: dayjs().year(),
    });

    if (income.length < 1) {
      await Income.create({
        _id: new ObjectId(),
        income: order[0].total,
        month: dayjs().month() + 1,
        year: dayjs().year(),
      });
    } else {
      await Income.findOneAndUpdate(
        {
          month: dayjs().month() + 1,
          year: dayjs().year(),
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
      { _id: req.body.productInfos.orderId },
      { $set: { status: "Finish", date: dayjs().toDate() } }
    );
    await ProductInCart.updateMany(
      { orderId: req.body.productInfos.orderId, status: "Delivering" },
      { $set: { status: "Finish", modify_date: dayjs().toDate() } }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Finish order fail 2",
    });
  }

  //get money to history

  next();
};



//test income history
module.exports.testIncomeHistory = async (req, res) => {
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
          month: "$month",
          year: "$year",
          day: "$day",
        },
        totalAmount: { $sum: "$total" },
      },
    },
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
