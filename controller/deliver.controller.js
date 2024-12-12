const Deliver = require("../model/deliver");
const Delivernotify = require("../model/delivernotify");
const Deliverorder = require("../model/deliverorder");
const User = require("../model/users");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const Order = require("../model/order");
const ProductInCart = require("../model/productincart");
const Product = require("../model/products");
const History = require("../model/history");
const Income = require("../model/income");

var ObjectID = require("mongodb").ObjectId;
dayjs.extend(customParseFormat);
require("dotenv").config();
dayjs().format();

async function compareHashedPassword(reqPassword, dbPassword) {
  var result;
  try {
    result = await bcrypt.compare(reqPassword, dbPassword);
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
  return result;
}

function checkTypedEmailPassword(email, password) {
  if (email == null || password == null || email == "" || password == "") {
    return false;
  } else {
    return true;
  }
}

async function checkTokenExpiration(token, key) {
  let tokenDecode;
  //verify token
  try {
    tokenDecode = jwt.verify(token.toString(), key);
    //decode tokena
    tokenDecode = jwt.decode(token.toString(), key);
  } catch {
    return { isExpire: true };
  }
  //if token is not expire
  return { isExpire: false, email: tokenDecode };
}

module.exports.loginDeliver = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const haveEmailPassword = checkTypedEmailPassword(email, password);

  if (haveEmailPassword) {
    const deliver = await Deliver.find({ email }).exec();
    if (deliver.length > 0) {
      const matched = await compareHashedPassword(
        password,
        deliver[0].password
      );
      if (matched) {
        const refreshToken = jwt.sign(
          {
            email: deliver[0].email,
            status: deliver[0].status,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1h" }
        );
        const token = jwt.sign(
          {
            email: deliver[0].email,
            status: deliver[0].status,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );
        const userFound = await Deliver.findOneAndUpdate(
          { email },
          { $push: { refreshToken } }
        );
        const u = await Deliver.find({ email });
        const notify = await Delivernotify.find({ email });
        const order = await Deliverorder.find({ email });
        return res.status(201).json({
          success: true,
          message: "login success",
          email,
          birthDay: u[0].birthDay,
          gender: u[0].sex,
          phoneNumber: u[0].phoneNumber,
          token,
          notify,
          order,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "no user found",
        });
      }
    }
  } else {
    console.log("email: " + email + "/npassword: " + password);
    return res.status(400).json({
      success: false,
      message: "please enter your email and password",
    });
  }
};

module.exports.createDeliver = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const repassword = req.body.repassword;

  console.log(req.body);

  if (email == "" || password == "" || repassword == "") {
    return res.status(400).json({
      success: false,
      message: "please fill all field",
    });
  }

  if (password !== repassword) {
    return res.status(400).json({
      success: false,
      message: "password and repassword not match!",
    });
  }

  Deliver.find({ email })
    .exec()
    .then((deliver) => {
      if (deliver.length > 0) {
        return res.status(409).json({
          success: false,
          message: "email existed",
        });
      }

      bcrypt.hash(password, 10, (err, hashed) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err,
          });
        }

        const deliver = new Deliver({
          _id: new mongoose.Types.ObjectId(),
          email,
          password: hashed,
        });
        deliver
          .save()
          .then((result) => {
            return res.status(200).json({
              success: true,
              data: {
                email: deliver.email,
              },
              message: "create user success!",
            });
          })
          .catch((err) => {
            return res.status(500).json({
              success: false,
              message: "email format is not correct",
            });
          });
      });
    });
};

module.exports.verifyDeliver = async (req, res, next) => {
  let access_token = "";
  const { email, refresh_token } = req.body;

  if (email === "") {
    return res.status(500).json({
      success: false,
      message: "no email",
    });
  }
  //retrive token from header authorization bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    access_token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(500).json({
      success: false,
      message: "header wrong",
    });
  }
  //check if access_token is expire
  const access_token_expiration = await checkTokenExpiration(
    access_token,
    (key = process.env.ACCESS_TOKEN_SECRET)
  );
  if (!access_token_expiration.isExpire) {
    //set new token to req body
    req.body.token = access_token;
    return next();
    // return res.status(200).json({
    //   success: true,
    //   access_token_expiration,
    //   message: "access token not expire",
    // });
  }

  console.log("token is expire, check refresh_token");
  //check if refresh_token is expire
  const deliver = await Deliver.find({ email });

  if (deliver.length > 1) {
    return res.status(500).json({
      success: false,
      message: "no user found",
    });
  }

  for (let index = 0; index < deliver[0].refreshToken.length; index++) {
    const refresh_token_expiration = await checkTokenExpiration(
      deliver[0].refreshToken[index],
      (key = process.env.REFRESH_TOKEN_SECRET)
    );

    if (!refresh_token_expiration.isExpire) {
      //sign a new token
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1m",
      });
      req.body.token = token;
      return next();
      // return res.status(200).json({
      //   success: true,
      //   refresh_token_expiration,
      //   message: "refresh token not expire",
      // });
    }
  }

  return res.status(500).json({
    success: false,
    message: "signin again",
    reason: "refresh token and access token are expire, require login again",
  });
};

module.exports.checkDeliver = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "authorized",
    token: req.body.token,
  });
};

module.exports.showAllOrder = async (req, res) => {
  // const { deliverId } = req.body;
  // const { email } = req.body;

  // console.log(deliverId);
  const listOrder = [];
  const data = await Deliverorder.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$orderId" },
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
    if (order.data.length > 0 && order.status === "Approved") {
      if (!order.deliverId) {
        const tempList = {
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          phoneNumber: order.phoneNumber,
          productInOrder: [...order.data],
        };
        listOrder.push(tempList);
      }
    }
  });
  console.log(listOrder);
  return res.status(200).json({
    success: true,
    listOrder,
  });
};

module.exports.takeOrder = async (req, res, next) => {
  const { email, orderId } = req.body;
  console.log("taking order");

  //check order is in Approved status or not
  const order = await Deliverorder.find({ orderId });
  if (order.length < 1) {
    return res.status(400).json({
      success: false,
      message: "no order found",
    });
  }
  if (order[0].status != "Approved") {
    return res.status(400).json({
      success: false,
      message: "order is not availible",
    });
  }

  //check if deliver exist or not
  const deliver = await Deliver.find({ email });
  if (deliver.length < 1) {
    return res.status(400).json({
      success: false,
      message: "no deliver found",
    });
  }

  //take order
  await Deliverorder.updateOne(
    { orderId },
    { $set: { status: "Delivering", deliverId: deliver[0]._id } }
  );
  next();
};

module.exports.showMyDeliveringOrder = async (req, res) => {
  const { email } = req.body;
  const listOrder = [];

  const data = await Deliverorder.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$orderId" },
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
  const deliver = await Deliver.find({ email });

  data.map((order) => {
    if (order.data.length > 0 && order.status === "Delivering") {
      if (
        order.deliverId &&
        order.deliverId.toString() == deliver[0]._id.toString()
      ) {
        const tempList = {
          orderId: order.orderId,
          deliverId: order.deliverId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          phoneNumber: order.phoneNumber,
          productInOrder: [...order.data],
        };
        listOrder.push(tempList);
      }
    }
  });
  // console.log(listOrder);
  return res.status(200).json({
    success: true,
    listOrder,
  });
};

module.exports.cancelOrder = async (req, res, next) => {
  const { reason, orderId } = req.body;
  //
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

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: "Please enter reason",
    });
  }

  const order = await Deliverorder.find({ orderId });
  if (order.length < 1) {
    return res.status(400).json({
      success: false,
      message: "No order found",
    });
  }

  if (order[0].status != "Delivering") {
    return res.status(400).json({
      success: false,
      message: `Order is in ${order[0].status} cannot be cancelled`,
    });
  }

  await Deliverorder.updateOne(
    { orderId },
    { $set: { status: "Cancelled", failReason: reason.toString() } }
  );
  next();
};

module.exports.showMyDeliveringSuccess = async (req, res) => {
  const { email } = req.body;
  const listOrder = [];

  const data = await Deliverorder.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$orderId" },
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
  const deliver = await Deliver.find({ email });

  data.map((order) => {
    if (order.data.length > 0 && order.status === "Delivered") {
      if (
        order.deliverId &&
        order.deliverId.toString() == deliver[0]._id.toString()
      ) {
        const tempList = {
          orderId: order.orderId,
          deliverId: order.deliverId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          phoneNumber: order.phoneNumber,
          url: order.finishUri,
          productInOrder: [...order.data],
        };
        listOrder.push(tempList);
      }
    }
  });
  // console.log(listOrder);
  return res.status(200).json({
    success: true,
    listOrder,
  });
};

module.exports.showMyDeliveringCancel = async (req, res) => {
  const { email } = req.body;
  const listOrder = [];

  const data = await Deliverorder.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$orderId" },
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
  const deliver = await Deliver.find({ email });

  data.map((order) => {
    if (order.data.length > 0 && order.status === "Cancelled") {
      if (
        order.deliverId &&
        order.deliverId.toString() == deliver[0]._id.toString()
      ) {
        const tempList = {
          orderId: order.orderId,
          deliverId: order.deliverId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          failReason: order.failReason,
          phoneNumber: order.phoneNumber,
          productInOrder: [...order.data],
        };
        listOrder.push(tempList);
      }
    }
  });
  // console.log(listOrder);
  return res.status(200).json({
    success: true,
    listOrder,
  });
};

module.exports.finishDeliverOrder = async (req, res, next) => {
  console.log(req.body.url);
  const { url, orderId } = req.body;

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
      _id: new mongoose.Types.ObjectId(),
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
        _id: new mongoose.Types.ObjectId(),
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

  await Deliverorder.updateOne(
    { orderId },
    { $set: { finishUri: url, status: "Delivered" } }
  );
  next();
};

module.exports.showOrderDetail = async (req, res) => {
  const { orderId, email } = req.body;

  // console.log(deliverId);
  const listOrder = [];

  const deliver = await Deliver.find({ email });
  const data = await Deliverorder.aggregate([
    {
      $lookup: {
        from: "productincarts",
        let: { order_id: "$orderId" },
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
    if (order.orderId == orderId) {
      if (order.deliverId) {
        const tempList = {
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          phoneNumber: order.phoneNumber,
          productInOrder: [...order.data],
          availible: false,
        };
        listOrder.push(tempList);
      } else {
        const tempList = {
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          address: order.address,
          name: order.name,
          phoneNumber: order.phoneNumber,
          productInOrder: [...order.data],
          availible: true,
        };
        listOrder.push(tempList);
      }
    }
  });
  console.log(listOrder);
  return res.status(200).json({
    success: true,
    listOrder,
  });
};

module.exports.showAllNotification = async (req, res) => {
  const deliverNoti = await Delivernotify.find();
  let deliverUnreadNoti = 0;
  deliverNoti.map((deliver) => {
    if (deliver.isRead != true) {
      deliverUnreadNoti++;
    }
  });

  return res.status(200).json({
    success: true,
    deliverUnreadNoti,
    deliverNoti,
  });
};

module.exports.markAsReadNotification = async (req, res, next) => {
  const { orderId } = req.body;

  await Delivernotify.updateOne({ orderId }, { $set: { isRead: true } });
  next();
};

module.exports.testCreateToken = async (req, res) => {
  const access_token = jwt.sign(
    { email: "deliver@gmail.com" },
    process.env.ACCESS_TOKEN_SECRET
  );
  const refresh_token = jwt.sign(
    { email: "deliver@gmail.com" },
    process.env.REFRESH_TOKEN_SECRET
  );
  return res.json({
    access_token,
    refresh_token,
  });
};
