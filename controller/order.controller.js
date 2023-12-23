const mongoose = require("mongoose");
const Order = require("../model/order");
const User = require("../model/users");

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
